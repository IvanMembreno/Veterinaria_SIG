import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service.js';
import { CreateConsultaDto } from './dto/create-consulta.dto.js';

@Injectable()
export class ConsultasService {
    constructor(private readonly prisma: PrismaService) {}

    async create(dto: CreateConsultaDto) {
        const cita = await this.prisma.cita.findUnique({
            where: { id: dto.citaId },
            include: { consulta: true },
        });
        if (!cita) throw new NotFoundException('Cita no encontrada');
        if (cita.consulta)
            throw new BadRequestException(
                'Esta cita ya tiene una consulta registrada',
            );

        return this.prisma.$transaction(async (tx) => {
            for (const item of dto.insumos ?? []) {
                const insumo = await tx.inventario.findUnique({
                    where: { id: item.insumoId },
                });
                if (!insumo)
                    throw new BadRequestException(
                        `Insumo ${item.insumoId} no existe`,
                    );
                if (insumo.stock < item.cantidad) {
                    throw new BadRequestException(
                        `Stock insuficiente de ${insumo.nombre}`,
                    );
                }
            }

            const consulta = await tx.consulta.create({
                data: {
                    citaId: dto.citaId,
                    diagnostico: dto.diagnostico,
                    tratamiento: dto.tratamiento,
                    observaciones: dto.observaciones,
                    peso: dto.peso,
                    temperatura: dto.temperatura,
                },
            });

            for (const item of dto.insumos ?? []) {
                await tx.consultaInsumo.create({
                    data: {
                        consultaId: consulta.id,
                        insumoId: item.insumoId,
                        cantidad: item.cantidad,
                    },
                });
                await tx.inventario.update({
                    where: { id: item.insumoId },
                    data: { stock: { decrement: item.cantidad } },
                });
                await tx.movimientoInventario.create({
                    data: {
                        insumoId: item.insumoId,
                        tipo: 'SALIDA_CONSULTA',
                        cantidad: item.cantidad,
                        nota: `Consulta ${consulta.id}`,
                    },
                });
            }

            let total = 0;
            const detalles: {
                servicioId: string;
                cantidad: number;
                precio: number;
            }[] = [];

            for (const item of dto.servicios) {
                const servicio = await tx.servicio.findUnique({
                    where: { id: item.servicioId },
                });
                if (!servicio)
                    throw new BadRequestException(
                        `Servicio ${item.servicioId} no existe`,
                    );
                const cantidad = item.cantidad ?? 1;
                total += servicio.precio * cantidad;
                detalles.push({
                    servicioId: servicio.id,
                    cantidad,
                    precio: servicio.precio,
                });
            }

            const factura = await tx.factura.create({
                data: {
                    consultaId: consulta.id,
                    total,
                    detalles: { create: detalles },
                },
                include: { detalles: true },
            });

            await tx.cita.update({
                where: { id: dto.citaId },
                data: { estado: 'ATENDIDA' },
            });

            return { consulta, factura };
        });
    }

    async findOne(id: string) {
        const consulta = await this.prisma.consulta.findUnique({
            where: { id },
            include: {
                cita: { include: { mascota: true } },
                insumos: { include: { insumo: true } },
                factura: {
                    include: { detalles: { include: { servicio: true } } },
                },
            },
        });
        if (!consulta) throw new NotFoundException('Consulta no encontrada');
        return consulta;
    }

    findAll() {
        return this.prisma.consulta.findMany({
            include: { cita: { include: { mascota: true } }, factura: true },
            orderBy: { createdAt: 'desc' },
        });
    }
}
