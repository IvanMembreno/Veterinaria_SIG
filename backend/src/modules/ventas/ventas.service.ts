import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service.js';
import { CreateVentaDto } from './dto/create-venta.dto.js';

@Injectable()
export class VentasService {
    constructor(private readonly prisma: PrismaService) {}

    async create(dto: CreateVentaDto) {
        return this.prisma.$transaction(async (tx) => {
            let total = 0;
            const detalles: {
                servicioId?: string;
                insumoId?: string;
                cantidad: number;
                precio: number;
            }[] = [];

            for (const item of dto.items) {
                if (item.tipo === 'servicio') {
                    const servicio = await tx.servicio.findUnique({
                        where: { id: item.id },
                    });
                    if (!servicio)
                        throw new BadRequestException(
                            `Servicio ${item.id} no existe`,
                        );
                    total += servicio.precio * item.cantidad;
                    detalles.push({
                        servicioId: servicio.id,
                        cantidad: item.cantidad,
                        precio: servicio.precio,
                    });
                } else {
                    const insumo = await tx.inventario.findUnique({
                        where: { id: item.id },
                    });
                    if (!insumo)
                        throw new BadRequestException(
                            `Insumo ${item.id} no existe`,
                        );

                    const resultado = await tx.inventario.updateMany({
                        where: { id: item.id, stock: { gte: item.cantidad } },
                        data: { stock: { decrement: item.cantidad } },
                    });
                    if (resultado.count === 0)
                        throw new BadRequestException(
                            `Stock insuficiente de ${insumo.nombre}`,
                        );

                    await tx.movimientoInventario.create({
                        data: {
                            insumoId: insumo.id,
                            tipo: 'VENTA',
                            cantidad: item.cantidad,
                            nota: 'Venta directa',
                        },
                    });

                    total += insumo.precioUnit * item.cantidad;
                    detalles.push({
                        insumoId: insumo.id,
                        cantidad: item.cantidad,
                        precio: insumo.precioUnit,
                    });
                }
            }

            const factura = await tx.factura.create({
                data: {
                    consultaId: null,
                    total,
                    metodoPago: dto.metodoPago,
                    detalles: { create: detalles },
                },
                include: {
                    detalles: {
                        include: { servicio: true, insumo: true },
                    },
                },
            });

            return factura;
        });
    }
}
