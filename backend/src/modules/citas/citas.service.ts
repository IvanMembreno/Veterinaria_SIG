import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
    ServiceUnavailableException,
} from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service.js';
import { CreateCitaDto } from './dto/create-cita.dto.js';
import { UpdateCitaDto } from './dto/update-cita.dto.js';
import { type TipoAvisoCita } from './dto/avisar-whatsapp-cita.dto.js';
import {
    formatearFechaWhatsapp,
    WhatsappService,
} from '../recordatorios/whatsapp.service.js';
import { leerTelefonoGuardado } from '../common/utils/telefono.js';

// Cada cita ocupa un bloque de 30 min.
const DURACION_CITA_MS = 30 * 60 * 1000;

// Incluye los datos de contacto del dueño para poder avisarle por WhatsApp.
const CITA_INCLUDE = {
    mascota: {
        include: {
            cliente: {
                select: {
                    id: true,
                    nombre: true,
                    telefono: true,
                    aceptaRecordatorios: true,
                },
            },
        },
    },
    usuario: { select: { id: true, nombre: true } },
} as const;

@Injectable()
export class CitasService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly whatsapp: WhatsappService,
    ) {}

    // Compara instantes para no depender de la zona horaria.
    private validarFechaFutura(fecha: Date) {
        if (fecha.getTime() < Date.now()) {
            throw new BadRequestException(
                'No se puede programar una cita en una fecha u hora pasada',
            );
        }
    }

    // Lanza 409 si el veterinario o la mascota ya tienen una cita vigente en el mismo bloque.
    private async validarChoqueHorario(
        datos: { fecha: Date; usuarioId: string; mascotaId: string },
        excluirId?: string,
    ) {
        const conflicto = await this.prisma.cita.findFirst({
            where: {
                ...(excluirId && { id: { not: excluirId } }),
                estado: { notIn: ['CANCELADA', 'NO_ASISTIO'] },
                fecha: {
                    gt: new Date(datos.fecha.getTime() - DURACION_CITA_MS),
                    lt: new Date(datos.fecha.getTime() + DURACION_CITA_MS),
                },
                OR: [
                    { usuarioId: datos.usuarioId },
                    { mascotaId: datos.mascotaId },
                ],
            },
            include: {
                mascota: { select: { nombre: true } },
                usuario: { select: { nombre: true } },
            },
        });
        if (!conflicto) return;

        const hora = conflicto.fecha.toLocaleTimeString('es', {
            hour: '2-digit',
            minute: '2-digit',
        });
        if (conflicto.usuarioId === datos.usuarioId) {
            throw new ConflictException(
                `El veterinario ya tiene una cita a esa hora (${hora}, con ${conflicto.mascota.nombre}).`,
            );
        }
        throw new ConflictException(
            `La mascota ya tiene una cita a esa hora (${hora}, con ${conflicto.usuario.nombre}).`,
        );
    }

    async create(dto: CreateCitaDto) {
        this.validarFechaFutura(new Date(dto.fecha));
        await this.validarChoqueHorario({
            fecha: new Date(dto.fecha),
            usuarioId: dto.usuarioId,
            mascotaId: dto.mascotaId,
        });
        return this.prisma.cita.create({
            data: { ...dto, fecha: new Date(dto.fecha) },
            include: CITA_INCLUDE,
        });
    }

    findAll() {
        return this.prisma.cita.findMany({
            include: CITA_INCLUDE,
            orderBy: { fecha: 'asc' },
        });
    }

    async findOne(id: string) {
        const cita = await this.prisma.cita.findUnique({
            where: { id },
            include: {
                mascota: { include: { cliente: true } },
                usuario: true,
                consulta: true,
            },
        });
        if (!cita) throw new NotFoundException('Cita no encontrada');
        return cita;
    }

    async update(id: string, dto: UpdateCitaDto) {
        const actual = await this.findOne(id);

        // Se completa con los valores actuales; cambiar solo el estado no se valida.
        const datos = {
            fecha: dto.fecha ? new Date(dto.fecha) : actual.fecha,
            usuarioId: dto.usuarioId ?? actual.usuarioId,
            mascotaId: dto.mascotaId ?? actual.mascotaId,
        };
        const cambiaFecha = datos.fecha.getTime() !== actual.fecha.getTime();
        if (cambiaFecha) this.validarFechaFutura(datos.fecha);

        const cambiaHorario =
            cambiaFecha ||
            datos.usuarioId !== actual.usuarioId ||
            datos.mascotaId !== actual.mascotaId;
        if (cambiaHorario) await this.validarChoqueHorario(datos, id);

        return this.prisma.cita.update({
            where: { id },
            data: { ...dto, ...(dto.fecha && { fecha: new Date(dto.fecha) }) },
            include: CITA_INCLUDE,
        });
    }

    async avisarWhatsapp(id: string, tipo: TipoAvisoCita = 'AGENDADA') {
        const cita = await this.prisma.cita.findUnique({
            where: { id },
            include: CITA_INCLUDE,
        });
        if (!cita) throw new NotFoundException('Cita no encontrada');

        // La cancelación usa su propia plantilla (WHATSAPP_TEMPLATE_CANCELACION).
        let plantilla: string | undefined;
        if (tipo === 'CANCELADA') {
            if (cita.estado !== 'CANCELADA') {
                throw new ConflictException(
                    'Solo se puede avisar la cancelación de citas canceladas.',
                );
            }
            plantilla = this.whatsapp.plantillaCancelacion ?? undefined;
            if (this.whatsapp.habilitado && !plantilla) {
                throw new ServiceUnavailableException(
                    'No hay una plantilla de WhatsApp configurada para avisar cancelaciones.',
                );
            }
        } else if (
            cita.estado !== 'PROGRAMADA' &&
            cita.estado !== 'CONFIRMADA'
        ) {
            throw new ConflictException(
                'Solo se puede avisar de citas programadas o confirmadas.',
            );
        }

        const { mascota } = cita;
        const cliente = mascota.cliente;
        const telefono = leerTelefonoGuardado(cliente.telefono);
        if (!telefono) {
            throw new BadRequestException(
                'El teléfono del cliente no es válido. Corrígelo en el directorio de clientes (8 dígitos, por ejemplo 7001-0001).',
            );
        }
        if (!cliente.aceptaRecordatorios) {
            throw new ConflictException(
                'El cliente no ha autorizado recibir recordatorios por WhatsApp.',
            );
        }

        const messageId = await this.whatsapp.enviarPlantilla(
            telefono,
            [
                cliente.nombre,
                this.whatsapp.clinicName,
                mascota.nombre,
                cita.motivo,
                formatearFechaWhatsapp(cita.fecha),
            ],
            plantilla,
        );

        return { ok: true, messageId };
    }

    async remove(id: string) {
        await this.findOne(id);
        return this.prisma.cita.update({
            where: { id },
            data: { estado: 'CANCELADA' },
        });
    }
}
