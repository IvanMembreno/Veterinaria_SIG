import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service.js';
import { CreateMascotaDto } from './dto/create-mascota.dto.js';
import { UpdateMascotaDto } from './dto/update-mascota.dto.js';

@Injectable()
export class MascotasService {
    constructor(private readonly prisma: PrismaService) {}

    create(dto: CreateMascotaDto, imagenUrl?: string) {
        return this.prisma.mascota.create({
            data: { ...dto, imagenUrl },
        });
    }

    findAll() {
        return this.prisma.mascota.findMany({
            include: { cliente: true },
            orderBy: { nombre: 'asc' },
        });
    }

    async findOne(id: string) {
        const mascota = await this.prisma.mascota.findUnique({
            where: { id },
            include: { cliente: true, citas: true },
        });
        if (!mascota) throw new NotFoundException('Mascota no encontrada');
        return mascota;
    }

    async update(id: string, dto: UpdateMascotaDto, imagenUrl?: string) {
        await this.findOne(id);
        return this.prisma.mascota.update({
            where: { id },
            data: { ...dto, ...(imagenUrl && { imagenUrl }) },
        });
    }

    async remove(id: string) {
        await this.findOne(id);
        return this.prisma.mascota.delete({ where: { id } });
    }
}
