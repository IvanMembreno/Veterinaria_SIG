import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service.js';
import { CreateClienteDto } from './dto/create-cliente.dto.js';
import { UpdateClienteDto } from './dto/update-cliente.dto.js';

@Injectable()
export class ClientesService {
    constructor(private readonly prisma: PrismaService) {}

    create(dto: CreateClienteDto) {
        return this.prisma.cliente.create({ data: dto });
    }

    findAll() {
        return this.prisma.cliente.findMany({
            include: { mascotas: true },
            orderBy: { nombre: 'asc' },
        });
    }

    async findOne(id: string) {
        const cliente = await this.prisma.cliente.findUnique({
            where: { id },
            include: { mascotas: true },
        });
        if (!cliente) throw new NotFoundException('Cliente no encontrado');
        return cliente;
    }

    async update(id: string, dto: UpdateClienteDto) {
        await this.findOne(id);
        return this.prisma.cliente.update({ where: { id }, data: dto });
    }

    async remove(id: string) {
        await this.findOne(id);
        return this.prisma.cliente.delete({ where: { id } });
    }
}
