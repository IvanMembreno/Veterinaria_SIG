import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service.js';
import { CreateServicioDto } from './dto/create-servicio.dto.js';
import { UpdateServicioDto } from './dto/update-servicio.dto.js';

@Injectable()
export class ServiciosService {
    constructor(private readonly prisma: PrismaService) {}

    create(dto: CreateServicioDto) {
        return this.prisma.servicio.create({ data: dto });
    }

    findAll() {
        return this.prisma.servicio.findMany({
            where: { activo: true },
            orderBy: { nombre: 'asc' },
        });
    }

    async findOne(id: string) {
        const servicio = await this.prisma.servicio.findUnique({
            where: { id },
        });
        if (!servicio) throw new NotFoundException('Servicio no encontrado');
        return servicio;
    }

    async update(id: string, dto: UpdateServicioDto) {
        await this.findOne(id);
        return this.prisma.servicio.update({ where: { id }, data: dto });
    }

    async remove(id: string) {
        await this.findOne(id);
        return this.prisma.servicio.update({
            where: { id },
            data: { activo: false },
        });
    }
}
