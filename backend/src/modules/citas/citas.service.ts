import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service.js';
import { CreateCitaDto } from './dto/create-cita.dto.js';
import { UpdateCitaDto } from './dto/update-cita.dto.js';

@Injectable()
export class CitasService {
    constructor(private readonly prisma: PrismaService) {}

    create(dto: CreateCitaDto) {
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
        await this.findOne(id);
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
