import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service.js';
import { CreateCitaDto } from './dto/create-cita.dto.js';
import { UpdateCitaDto } from './dto/update-cita.dto.js';

// Cada cita ocupa un bloque de 30 min.
const DURACION_CITA_MS = 30 * 60 * 1000;

@Injectable()
export class CitasService {
    constructor(private readonly prisma: PrismaService) {}

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
            include: {
                mascota: true,
                usuario: { select: { id: true, nombre: true } },
            },
        });
    }

    findAll() {
        return this.prisma.cita.findMany({
            include: {
                mascota: true,
                usuario: { select: { id: true, nombre: true } },
            },
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
        });
    }

    async remove(id: string) {
        await this.findOne(id);
        return this.prisma.cita.update({
            where: { id },
            data: { estado: 'CANCELADA' },
        });
    }
}
