import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service.js';
import { CreateRecordatorioDto } from './dto/create-recordatorio.dto.js';
import { UpdateRecordatorioDto } from './dto/update-recordatorio.dto.js';
import { ListRecordatoriosQueryDto } from './dto/list-recordatorios-query.dto.js';

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
        },
    },
} as const;

@Injectable()
export class RecordatoriosService {
    constructor(private readonly prisma: PrismaService) {}

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
