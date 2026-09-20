import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service.js';
import { CreateConsultaDto } from './dto/create-consulta.dto.js';

const DIAS_REFUERZO_VACUNA = 21;

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
                const resultado = await tx.inventario.updateMany({
                    where: { id: item.insumoId, stock: { gte: item.cantidad } },
                    data: { stock: { decrement: item.cantidad } },
                });

                if (resultado.count === 0) {
                    const insumo = await tx.inventario.findUnique({
                        where: { id: item.insumoId },
                    });
                    if (!insumo) {
                        throw new BadRequestException(
                            `Insumo ${item.insumoId} no existe`,
                        );
                    }
                    throw new BadRequestException(
                        `Stock insuficiente de ${insumo.nombre}`,
                    );
                }

                await tx.consultaInsumo.create({
                    data: {
                        consultaId: consulta.id,
                        insumoId: item.insumoId,
                        cantidad: item.cantidad,
                    },
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
            const serviciosVacuna: { nombre: string }[] = [];

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
                if (servicio.esVacuna) {
                    serviciosVacuna.push({ nombre: servicio.nombre });
                }
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

            if (serviciosVacuna.length > 0) {
                const fechaProgramada = new Date(cita.fecha);
                fechaProgramada.setDate(
                    fechaProgramada.getDate() + DIAS_REFUERZO_VACUNA,
                );

                for (const servicioVacuna of serviciosVacuna) {
                    await tx.recordatorio.create({
                        data: {
                            mascotaId: cita.mascotaId,
                            tipo: 'VACUNA',
                            fechaProgramada,
                            estado: 'PENDIENTE',
                            nota: `Refuerzo de la vacuna "${servicioVacuna.nombre}" aplicada el ${cita.fecha.toLocaleDateString('es')}.`,
                        },
                    });
                }
            }

            return { consulta, factura };
        });
    }

    async findOne(id: string) {
        const consulta = await this.prisma.consulta.findUnique({
            where: { id },
            include: {
                cita: { include: { mascota: true } },
                insumos: { include: { insumo: true } },
                facturas: {
                    include: { detalles: { include: { servicio: true } } },
                },
            },
        });
        if (!consulta) throw new NotFoundException('Consulta no encontrada');
        return consulta;
    }

    findAll() {
        return this.prisma.consulta.findMany({
            include: { cita: { include: { mascota: true } }, facturas: true },
            orderBy: { createdAt: 'desc' },
        });
    }
}
