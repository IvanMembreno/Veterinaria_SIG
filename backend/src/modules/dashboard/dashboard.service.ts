import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service.js';

const capitalizar = (texto: string) =>
    texto.charAt(0).toUpperCase() + texto.slice(1);

@Injectable()
export class DashboardService {
    constructor(private readonly prisma: PrismaService) {}

    async ingresosPorServicio() {
        const detalles = await this.prisma.facturaDetalle.findMany({
            where: { factura: { estado: 'PAGADA' } },
            include: { servicio: { select: { nombre: true } } },
        });

        const acumulado = new Map<
            string,
            { servicio: string; totalIngresos: number; vecesVendido: number }
        >();
        for (const d of detalles) {
            const nombre = d.servicio?.nombre ?? 'Venta de productos';
            const actual = acumulado.get(nombre) ?? {
                servicio: nombre,
                totalIngresos: 0,
                vecesVendido: 0,
            };
            actual.totalIngresos += d.precio * d.cantidad;
            actual.vecesVendido += d.cantidad;
            acumulado.set(nombre, actual);
        }

        return Array.from(acumulado.values())
            .map((a) => ({
                ...a,
                totalIngresos: Number(a.totalIngresos.toFixed(2)),
            }))
            .sort((a, b) => b.totalIngresos - a.totalIngresos);
    }

    async ingresosPorMes() {
        const hoy = new Date();
        const desde = new Date(hoy.getFullYear(), hoy.getMonth() - 5, 1);

        const facturas = await this.prisma.factura.findMany({
            where: { estado: 'PAGADA', fecha: { gte: desde } },
            select: { fecha: true, total: true },
        });

        const meses = Array.from({ length: 6 }, (_, i) => {
            const fecha = new Date(
                desde.getFullYear(),
                desde.getMonth() + i,
                1,
            );
            return {
                anio: fecha.getFullYear(),
                mes: fecha.getMonth(),
                etiqueta: capitalizar(
                    fecha.toLocaleDateString('es', { month: 'short' }),
                ),
                total: 0,
            };
        });

        for (const f of facturas) {
            const destino = meses.find(
                (m) =>
                    m.anio === f.fecha.getFullYear() &&
                    m.mes === f.fecha.getMonth(),
            );
            if (destino) destino.total += f.total;
        }

        return meses.map((m) => ({
            mes: m.etiqueta,
            total: Number(m.total.toFixed(2)),
        }));
    }

    async ingresosPorMetodoPago() {
        const grupos = await this.prisma.factura.groupBy({
            by: ['metodoPago'],
            where: { estado: 'PAGADA' },
            _sum: { total: true },
        });

        return grupos.map((g) => ({
            metodo: capitalizar(g.metodoPago ?? 'sin especificar'),
            total: Number((g._sum.total ?? 0).toFixed(2)),
        }));
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

    async mascotasPorEspecie() {
        const grupos = await this.prisma.mascota.groupBy({
            by: ['especie'],
            _count: { _all: true },
        });

        return grupos
            .map((g) => ({ especie: g.especie, total: g._count._all }))
            .sort((a, b) => b.total - a.total);
    }

    async ticketPromedio() {
        const facturas = await this.prisma.factura.findMany({
            where: { estado: 'PAGADA' },
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
                id: i.id,
                nombre: i.nombre,
                stock: i.stock,
                stockMinimo: i.stockMinimo,
            }));
    }

    async alertasVencimiento() {
        const limite = new Date();
        limite.setDate(limite.getDate() + 30);

        const insumos = await this.prisma.inventario.findMany({
            where: { fechaVenc: { not: null, lte: limite }, stock: { gt: 0 } },
            orderBy: { fechaVenc: 'asc' },
        });

        return insumos.map((i) => ({
            id: i.id,
            nombre: i.nombre,
            lote: i.lote,
            fechaVenc: i.fechaVenc,
            stock: i.stock,
        }));
    }

    async resumen() {
        const [
            ingresosPorServicio,
            ingresosPorMes,
            ingresosPorMetodoPago,
            consultasPorVeterinario,
            mascotasPorEspecie,
            ticketPromedio,
            ocupacionAgenda,
            alertasStockBajo,
            alertasVencimiento,
        ] = await Promise.all([
            this.ingresosPorServicio(),
            this.ingresosPorMes(),
            this.ingresosPorMetodoPago(),
            this.consultasPorVeterinario(),
            this.mascotasPorEspecie(),
            this.ticketPromedio(),
            this.tasaOcupacion(),
            this.stockBajo(),
            this.alertasVencimiento(),
        ]);

        return {
            ingresosPorServicio,
            ingresosPorMes,
            ingresosPorMetodoPago,
            consultasPorVeterinario,
            mascotasPorEspecie,
            ticketPromedio,
            ocupacionAgenda,
            alertasStockBajo,
            alertasVencimiento,
        };
    }
}
