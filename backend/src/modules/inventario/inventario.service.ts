import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service.js';
import { CreateInsumoDto } from './dto/create-insumo.dto.js';
import { UpdateInsumoDto } from './dto/update-insumo.dto.js';
import { RegistrarEntradaDto } from './dto/registrar-entrada.dto.js';
import { esPosteriorAHoy, estaVencido, formatearDia } from './vencimiento.js';

@Injectable()
export class InventarioService {
    constructor(private readonly prisma: PrismaService) {}

    create(dto: CreateInsumoDto, imagenUrl?: string) {
        return this.prisma.inventario.create({
            data: {
                ...dto,
                fechaVenc: dto.fechaVenc ? new Date(dto.fechaVenc) : undefined,
                imagenUrl,
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

    async update(id: string, dto: UpdateInsumoDto, imagenUrl?: string) {
        await this.findOne(id);
        return this.prisma.inventario.update({
            where: { id },
            data: {
                ...dto,
                ...(dto.fechaVenc !== undefined && {
                    fechaVenc: dto.fechaVenc ? new Date(dto.fechaVenc) : null,
                }),
                ...(imagenUrl && { imagenUrl }),
            },
        });
    }

    // Un producto vencido solo se reabastece sin existencias y con lote y vencimiento nuevos.
    registrarEntrada(id: string, dto: RegistrarEntradaDto) {
        return this.prisma.$transaction(async (tx) => {
            const actual = await tx.inventario.findUnique({ where: { id } });
            if (!actual) throw new NotFoundException('Insumo no encontrado');

            const fechaVenc = dto.fechaVenc ? new Date(dto.fechaVenc) : null;
            if (estaVencido(actual.fechaVenc)) {
                if (actual.stock > 0) {
                    throw new BadRequestException(
                        `Producto vencido con ${actual.stock} existencias: primero debe darse de baja el lote vencido.`,
                    );
                }
                if (!dto.lote || !fechaVenc) {
                    throw new BadRequestException(
                        'Producto vencido: para reabastecerlo indique el lote nuevo y su fecha de vencimiento.',
                    );
                }
                if (!esPosteriorAHoy(fechaVenc)) {
                    throw new BadRequestException(
                        'La nueva fecha de vencimiento debe ser posterior a hoy.',
                    );
                }
            }

            const insumo = await tx.inventario.update({
                where: { id },
                data: {
                    stock: { increment: dto.cantidad },
                    ...(dto.lote && { lote: dto.lote }),
                    ...(fechaVenc && { fechaVenc }),
                },
            });

            const notaLote =
                dto.lote && fechaVenc
                    ? `Entrada con nuevo lote ${dto.lote} (vence ${formatearDia(fechaVenc)})`
                    : undefined;
            await tx.movimientoInventario.create({
                data: {
                    insumoId: id,
                    tipo: 'ENTRADA',
                    cantidad: dto.cantidad,
                    nota:
                        [notaLote, dto.nota].filter(Boolean).join(' · ') ||
                        undefined,
                },
            });
            return insumo;
        });
    }

    // Descarta las existencias de un producto vencido y deja constancia como AJUSTE.
    darDeBaja(id: string) {
        return this.prisma.$transaction(async (tx) => {
            const actual = await tx.inventario.findUnique({ where: { id } });
            if (!actual) throw new NotFoundException('Insumo no encontrado');
            if (!estaVencido(actual.fechaVenc)) {
                throw new BadRequestException(
                    'Solo se pueden dar de baja productos vencidos.',
                );
            }
            if (actual.stock <= 0) {
                throw new BadRequestException(
                    'El producto no tiene existencias para dar de baja.',
                );
            }

            // Solo descuenta si las existencias no cambiaron desde la lectura (p. ej. por una venta).
            const { count } = await tx.inventario.updateMany({
                where: { id, stock: actual.stock },
                data: { stock: 0 },
            });
            if (count === 0) {
                throw new ConflictException(
                    'Las existencias cambiaron mientras se procesaba la baja. Intenta de nuevo.',
                );
            }
            await tx.movimientoInventario.create({
                data: {
                    insumoId: id,
                    tipo: 'AJUSTE',
                    cantidad: actual.stock,
                    nota: `Baja por vencimiento (${actual.lote ? `lote ${actual.lote}` : 'sin lote'})`,
                },
            });
            return { ...actual, stock: 0 };
        });
    }

    historialMovimientos(id: string) {
        return this.prisma.movimientoInventario.findMany({
            where: { insumoId: id },
            orderBy: { fecha: 'desc' },
        });
    }
}
