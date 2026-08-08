import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service.js';

@Injectable()
export class DashboardService {
    constructor(private readonly prisma: PrismaService) {}

    async ingresosPorServicio() {
        const detalles = await this.prisma.facturaDetalle.groupBy({
            by: ['servicioId'],
            _sum: { precio: true, cantidad: true },
        });

        const servicios = await this.prisma.servicio.findMany();
        return detalles.map((d) => {
            const servicio = servicios.find((s) => s.id === d.servicioId);
            return {
                servicio: servicio?.nombre ?? 'Desconocido',
                totalIngresos: (d._sum.precio ?? 0) * (d._sum.cantidad ?? 1),
                vecesVendido: d._sum.cantidad ?? 0,
            };
        });
    }

    async consultasPorVeterinario() {
        const citas = await this.prisma.cita.findMany({
            where: { estado: 'ATENDIDA' },
            include: { usuario: { select: { id: true, nombre: true } } },
        });

        const conteo = new Map<string, { nombre: string; total: number }>();
        for (const c of citas) {
            const actual = conteo.get(c.usuarioId) ?? {
                nombre: c.usuario.nombre,
                total: 0,
            };
            actual.total += 1;
            conteo.set(c.usuarioId, actual);
        }
        return Array.from(conteo.values());
    }

    async ticketPromedio() {
        const facturas = await this.prisma.factura.findMany({
            select: { total: true },
        });
        if (facturas.length === 0)
            return { ticketPromedio: 0, totalFacturas: 0 };
        const suma = facturas.reduce((acc, f) => acc + f.total, 0);
        return {
            ticketPromedio: Number((suma / facturas.length).toFixed(2)),
            totalFacturas: facturas.length,
        };
    }

    async tasaOcupacion() {
        const total = await this.prisma.cita.count();
        const atendidas = await this.prisma.cita.count({
            where: { estado: 'ATENDIDA' },
        });
        const noAsistio = await this.prisma.cita.count({
            where: { estado: 'NO_ASISTIO' },
        });
        const canceladas = await this.prisma.cita.count({
            where: { estado: 'CANCELADA' },
        });

        return {
            totalCitas: total,
            atendidas,
            noAsistio,
            canceladas,
            tasaAsistencia:
                total > 0 ? Number(((atendidas / total) * 100).toFixed(1)) : 0,
            tasaAusentismo:
                total > 0 ? Number(((noAsistio / total) * 100).toFixed(1)) : 0,
        };
    }

    async stockBajo() {
        const insumos = await this.prisma.inventario.findMany();
        return insumos
            .filter((i) => i.stock <= i.stockMinimo)
            .map((i) => ({
                nombre: i.nombre,
                stock: i.stock,
                stockMinimo: i.stockMinimo,
            }));
    }

    async resumen() {
        const [ingresos, porVeterinario, ticket, ocupacion, alertas] =
            await Promise.all([
                this.ingresosPorServicio(),
                this.consultasPorVeterinario(),
                this.ticketPromedio(),
                this.tasaOcupacion(),
                this.stockBajo(),
            ]);

        return {
            ingresosPorServicio: ingresos,
            consultasPorVeterinario: porVeterinario,
            ticketPromedio: ticket,
            ocupacionAgenda: ocupacion,
            alertasStockBajo: alertas,
        };
    }
}
