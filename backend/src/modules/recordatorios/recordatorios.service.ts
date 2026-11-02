import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service.js';
import { CreateRecordatorioDto } from './dto/create-recordatorio.dto.js';
import { UpdateRecordatorioDto } from './dto/update-recordatorio.dto.js';
import { ListRecordatoriosQueryDto } from './dto/list-recordatorios-query.dto.js';
import { formatearFechaWhatsapp, WhatsappService } from './whatsapp.service.js';
import { leerTelefonoGuardado } from '../common/utils/telefono.js';
import {
    EstadoRecordatorio,
    TipoRecordatorio,
} from '../../generated/prisma/enums.js';

// Mantener en línea con frontend/src/features/recordatorios/whatsapp.ts.
const MOTIVO_WHATSAPP: Record<TipoRecordatorio, string> = {
    VACUNA: 'Vacunación',
    CONTROL: 'Control',
};

const MASCOTA_CONTACTO_SELECT = {
    id: true,
    nombre: true,
    especie: true,
    cliente: {
        select: {
            id: true,
            nombre: true,
            telefono: true,
            email: true,
            aceptaRecordatorios: true,
        },
    },
} as const;

@Injectable()
export class RecordatoriosService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly whatsapp: WhatsappService,
    ) {}

    estadoWhatsapp() {
        return {
            apiHabilitada: this.whatsapp.habilitado,
            plantillaCancelacion: this.whatsapp.plantillaCancelacion !== null,
        };
    }

    async enviarWhatsapp(id: string) {
        const recordatorio = await this.prisma.recordatorio.findUnique({
            where: { id },
            include: { mascota: { select: MASCOTA_CONTACTO_SELECT } },
        });
        if (!recordatorio)
            throw new NotFoundException('Recordatorio no encontrado');
        if (recordatorio.estado !== EstadoRecordatorio.PENDIENTE) {
            throw new ConflictException(
                'Solo se pueden enviar recordatorios pendientes.',
            );
        }

        const { mascota } = recordatorio;
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

        const messageId = await this.whatsapp.enviarPlantilla(telefono, [
            cliente.nombre,
            this.whatsapp.clinicName,
            mascota.nombre,
            MOTIVO_WHATSAPP[recordatorio.tipo],
            formatearFechaWhatsapp(recordatorio.fechaProgramada),
        ]);

        await this.prisma.recordatorio.update({
            where: { id },
            data: {
                estado: EstadoRecordatorio.ENVIADO,
                contactoEnviado: new Date(),
            },
        });

        return { ok: true, messageId };
    }

    create(dto: CreateRecordatorioDto) {
        return this.prisma.recordatorio.create({ data: dto });
    }

    findAll(query: ListRecordatoriosQueryDto) {
        return this.prisma.recordatorio.findMany({
            where: {
                ...(query.mascotaId && { mascotaId: query.mascotaId }),
                ...(query.estado && { estado: query.estado }),
            },
            include: { mascota: { select: MASCOTA_CONTACTO_SELECT } },
            orderBy: { fechaProgramada: 'asc' },
        });
    }

    async findOne(id: string) {
        const recordatorio = await this.prisma.recordatorio.findUnique({
            where: { id },
        });
        if (!recordatorio)
            throw new NotFoundException('Recordatorio no encontrado');
        return recordatorio;
    }

    async update(id: string, dto: UpdateRecordatorioDto) {
        await this.findOne(id);
        return this.prisma.recordatorio.update({ where: { id }, data: dto });
    }

    async remove(id: string) {
        await this.findOne(id);
        return this.prisma.recordatorio.delete({ where: { id } });
    }
}
