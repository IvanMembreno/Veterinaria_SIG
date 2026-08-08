import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service.js';
import { CreateInsumoDto } from './dto/create-insumo.dto.js';
import { RegistrarEntradaDto } from './dto/registrar-entrada.dto.js';

@Injectable()
export class InventarioService {
    constructor(private readonly prisma: PrismaService) {}

    create(dto: CreateInsumoDto) {
        return this.prisma.inventario.create({
            data: {
                ...dto,
                fechaVenc: dto.fechaVenc ? new Date(dto.fechaVenc) : undefined,
            },
        });
    }

    findAll() {
        return this.prisma.inventario.findMany({ orderBy: { nombre: 'asc' } });
    }

    async findOne(id: string) {
        const insumo = await this.prisma.inventario.findUnique({
            where: { id },
        });
        if (!insumo) throw new NotFoundException('Insumo no encontrado');
        return insumo;
    }

    async registrarEntrada(id: string, dto: RegistrarEntradaDto) {
        await this.findOne(id);
        return this.prisma.$transaction(async (tx) => {
            const insumo = await tx.inventario.update({
                where: { id },
                data: { stock: { increment: dto.cantidad } },
            });
            await tx.movimientoInventario.create({
                data: {
                    insumoId: id,
                    tipo: 'ENTRADA',
                    cantidad: dto.cantidad,
                    nota: dto.nota,
                },
            });
            return insumo;
        });
    }

    historialMovimientos(id: string) {
        return this.prisma.movimientoInventario.findMany({
            where: { insumoId: id },
            orderBy: { fecha: 'desc' },
        });
    }
}
