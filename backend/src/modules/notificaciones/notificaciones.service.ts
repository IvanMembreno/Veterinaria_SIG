import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service.js';
import { DashboardService } from '../dashboard/dashboard.service.js';
import { EstadoCita, Role } from '../../generated/prisma/enums.js';

export type Severidad = 'alta' | 'media' | 'info';
export type Lectura = 'diaria' | 'unica';

export interface Notificacion {
    id: string;
    tipo: string;
    severidad: Severidad;
    titulo: string;
    detalle: string;
    ruta: string;
    fecha: Date;
    // Pendientes que representa: 1 en las individuales, el total en las agrupadas.
    cantidad: number;
    // 'diaria': si sigue vigente vuelve a aparecer al día siguiente; 'unica': se lee una vez.
    lectura: Lectura;
}

interface Alerta {
    id: string;
    nombre: string;
    titulo: string;
    detalle: string;
    fecha: Date;
}

interface TipoNotificacion {
    tipo: string;
    severidad: Severidad;
    ruta: string;
    // Título de la notificación agrupada, p. ej. "5 insumos con stock bajo".
    resumen: (cantidad: number) => string;
    // Hasta cuántas se muestran por separado; 0 agrupa siempre. Por defecto MAX_INDIVIDUALES.
    maxIndividuales?: number;
    lectura?: Lectura;
}

const ORDEN_SEVERIDAD: Record<Severidad, number> = {
    alta: 0,
    media: 1,
    info: 2,
};

// Con más alertas que esto, las de un mismo tipo se juntan en una sola notificación.
const MAX_INDIVIDUALES = 3;
const DIA_MS = 1000 * 60 * 60 * 24;

const ETIQUETA_RECORDATORIO: Record<string, string> = {
    VACUNA: 'Vacuna',
    CONTROL: 'Control',
};

const plural = (n: number, singular: string, varios: string) =>
    n === 1 ? singular : varios;

const ZONA_HORARIA = 'America/El_Salvador';

const formatoHora = new Intl.DateTimeFormat('es-SV', {
    timeZone: ZONA_HORARIA,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
});

const formatoFechaHora = new Intl.DateTimeFormat('es-SV', {
    timeZone: ZONA_HORARIA,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
});

// Citas que aún no se atienden ni se cierran.
const ESTADOS_ABIERTOS: EstadoCita[] = ['PROGRAMADA', 'CONFIRMADA'];

const INCLUDE_MASCOTA_Y_PROPIETARIO = {
    mascota: {
        select: { nombre: true, cliente: { select: { nombre: true } } },
    },
} as const;

const inicioDeHoy = () => {
    const fecha = new Date();
    fecha.setHours(0, 0, 0, 0);
    return fecha;
};

const finDeHoy = () => {
    const fecha = new Date();
    fecha.setHours(23, 59, 59, 999);
    return fecha;
};

@Injectable()
export class NotificacionesService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly dashboardService: DashboardService,
    ) {}

    async listar(usuario: { id: string; rol: Role }) {
        const { rol } = usuario;
        const tareas: Promise<Notificacion[]>[] = [];

        if (rol === Role.GERENTE || rol === Role.INVENTARIO) {
            tareas.push(this.inventario());
        }
        if (rol === Role.GERENTE || rol === Role.RECEPCION) {
            tareas.push(
                this.recordatorios(),
                this.citasSinConfirmar(),
                this.facturasPendientes(),
            );
        }
        if (rol === Role.VETERINARIO) {
            tareas.push(
                this.citasDeHoyVeterinario(usuario.id),
                this.citasNuevasVeterinario(usuario.id),
                this.citasSinCerrarVeterinario(usuario.id),
                this.recordatorios(usuario.id),
            );
        }

        const notificaciones = (await Promise.all(tareas)).flat();
        return notificaciones.sort(
            (a, b) =>
                ORDEN_SEVERIDAD[a.severidad] - ORDEN_SEVERIDAD[b.severidad] ||
                a.fecha.getTime() - b.fecha.getTime(),
        );
    }

    private agrupar(
        config: TipoNotificacion,
        alertas: Alerta[],
    ): Notificacion[] {
        if (alertas.length === 0) return [];
        const base = {
            tipo: config.tipo,
            severidad: config.severidad,
            ruta: config.ruta,
            lectura: config.lectura ?? 'diaria',
        };
        const maxIndividuales = config.maxIndividuales ?? MAX_INDIVIDUALES;

        if (alertas.length <= maxIndividuales) {
            return alertas.map((a) => ({
                ...base,
                id: `${config.tipo}-${a.id}`,
                titulo: a.titulo,
                detalle: a.detalle,
                fecha: a.fecha,
                cantidad: 1,
            }));
        }

        const nombres = alertas.slice(0, MAX_INDIVIDUALES).map((a) => a.nombre);
        const restantes = alertas.length - nombres.length;
        return [
            {
                ...base,
                // La cantidad forma parte del id para que vuelva a aparecer si cambia.
                id: `${config.tipo}-grupo-${alertas.length}`,
                titulo: config.resumen(alertas.length),
                detalle:
                    restantes > 0
                        ? `${nombres.join(', ')} y ${restantes} más`
                        : nombres.join(', '),
                cantidad: alertas.length,
                fecha: new Date(
                    Math.min(...alertas.map((a) => a.fecha.getTime())),
                ),
            },
        ];
    }

    private async inventario() {
        const [stockBajo, vencimientos] = await Promise.all([
            this.dashboardService.stockBajo(),
            this.dashboardService.alertasVencimiento(),
        ]);
        const ahora = new Date();

        const agotados: Alerta[] = stockBajo
            .filter((i) => i.stock <= 0)
            .map((i) => ({
                id: i.id,
                nombre: i.nombre,
                titulo: `${i.nombre} sin stock`,
                detalle: `Existencias agotadas (mínimo ${i.stockMinimo})`,
                fecha: ahora,
            }));

        const bajos: Alerta[] = stockBajo
            .filter((i) => i.stock > 0)
            .map((i) => ({
                id: i.id,
                nombre: i.nombre,
                titulo: `Stock bajo: ${i.nombre}`,
                detalle: `Quedan ${i.stock} (mínimo ${i.stockMinimo})`,
                fecha: ahora,
            }));

        const vencidos: Alerta[] = [];
        const porVencer: Alerta[] = [];
        for (const i of vencimientos) {
            if (!i.fechaVenc) continue;
            const dias = Math.ceil(
                (i.fechaVenc.getTime() - ahora.getTime()) / DIA_MS,
            );
            const lote = i.lote ? `Lote ${i.lote} · ` : '';
            if (dias < 0) {
                vencidos.push({
                    id: i.id,
                    nombre: i.nombre,
                    titulo: `${i.nombre} vencido`,
                    detalle: `${lote}${i.stock} en stock`,
                    fecha: i.fechaVenc,
                });
            } else {
                porVencer.push({
                    id: i.id,
                    nombre: i.nombre,
                    titulo: `${i.nombre} vence pronto`,
                    detalle: `${lote}vence en ${dias} ${plural(dias, 'día', 'días')}`,
                    fecha: i.fechaVenc,
                });
            }
        }

        return [
            ...this.agrupar(
                {
                    tipo: 'stock-agotado',
                    severidad: 'alta',
                    ruta: '/inventario',
                    resumen: (n) => `${n} insumos sin stock`,
                },
                agotados,
            ),
            ...this.agrupar(
                {
                    tipo: 'stock-bajo',
                    severidad: 'media',
                    ruta: '/inventario',
                    resumen: (n) => `${n} insumos con stock bajo`,
                },
                bajos,
            ),
            ...this.agrupar(
                {
                    tipo: 'insumo-vencido',
                    severidad: 'alta',
                    ruta: '/inventario',
                    resumen: (n) => `${n} insumos vencidos con existencias`,
                },
                vencidos,
            ),
            ...this.agrupar(
                {
                    tipo: 'insumo-por-vencer',
                    severidad: 'media',
                    ruta: '/inventario',
                    resumen: (n) =>
                        `${n} insumos vencen en los próximos 30 días`,
                },
                porVencer,
            ),
        ];
    }

    // Con veterinarioId (VET d) solo cuenta mascotas que ese veterinario ha atendido, agrupadas.
    private async recordatorios(veterinarioId?: string) {
        const inicio = inicioDeHoy();
        const recordatorios = await this.prisma.recordatorio.findMany({
            where: {
                estado: 'PENDIENTE',
                fechaProgramada: { lte: finDeHoy() },
                ...(veterinarioId && {
                    mascota: { citas: { some: { usuarioId: veterinarioId } } },
                }),
            },
            include: { mascota: { select: { nombre: true } } },
            orderBy: { fechaProgramada: 'asc' },
        });

        const vencidos: Alerta[] = [];
        const deHoy: Alerta[] = [];
        for (const r of recordatorios) {
            const etiqueta = ETIQUETA_RECORDATORIO[r.tipo] ?? r.tipo;
            const alerta = {
                id: r.id,
                nombre: r.mascota.nombre,
                detalle: r.nota ? `${etiqueta} · ${r.nota}` : etiqueta,
                fecha: r.fechaProgramada,
            };
            if (r.fechaProgramada < inicio) {
                vencidos.push({
                    ...alerta,
                    titulo: `Recordatorio vencido: ${r.mascota.nombre}`,
                });
            } else {
                deHoy.push({
                    ...alerta,
                    titulo: `Recordatorio para hoy: ${r.mascota.nombre}`,
                });
            }
        }

        return [
            ...this.agrupar(
                {
                    tipo: 'recordatorio-vencido',
                    severidad: 'alta',
                    ruta: '/recordatorios',
                    resumen: (n) =>
                        `${n} ${plural(n, 'recordatorio vencido sin completar', 'recordatorios vencidos sin completar')}`,
                    maxIndividuales: veterinarioId ? 0 : undefined,
                },
                vencidos,
            ),
            ...this.agrupar(
                {
                    tipo: 'recordatorio-hoy',
                    severidad: 'media',
                    ruta: '/recordatorios',
                    resumen: (n) =>
                        `${n} ${plural(n, 'recordatorio programado para hoy', 'recordatorios programados para hoy')}`,
                    maxIndividuales: veterinarioId ? 0 : undefined,
                },
                deHoy,
            ),
        ];
    }

    private async citasSinConfirmar() {
        const citas = await this.prisma.cita.findMany({
            where: {
                estado: 'PROGRAMADA',
                fecha: { gte: inicioDeHoy(), lte: finDeHoy() },
            },
            include: { mascota: { select: { nombre: true } } },
            orderBy: { fecha: 'asc' },
        });

        return this.agrupar(
            {
                tipo: 'cita-sin-confirmar',
                severidad: 'media',
                ruta: '/citas',
                resumen: (n) => `${n} citas de hoy sin confirmar`,
            },
            citas.map((c) => ({
                id: c.id,
                nombre: c.mascota.nombre,
                titulo: `Cita sin confirmar: ${c.mascota.nombre}`,
                detalle: c.motivo,
                fecha: c.fecha,
            })),
        );
    }

    private async facturasPendientes() {
        const ahora = new Date();
        const limite = new Date(ahora.getTime() - 3 * DIA_MS);
        const facturas = await this.prisma.factura.findMany({
            where: { estado: 'PENDIENTE', fecha: { lt: limite } },
            include: {
                consulta: {
                    select: {
                        cita: {
                            select: {
                                mascota: {
                                    select: {
                                        cliente: { select: { nombre: true } },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            orderBy: { fecha: 'asc' },
        });

        return this.agrupar(
            {
                tipo: 'factura-pendiente',
                severidad: 'media',
                ruta: '/facturas',
                resumen: (n) => `${n} facturas pendientes con más de 3 días`,
            },
            facturas.map((f) => {
                const cliente =
                    f.consulta?.cita.mascota.cliente.nombre ?? 'Venta directa';
                const dias = Math.floor(
                    (ahora.getTime() - f.fecha.getTime()) / DIA_MS,
                );
                return {
                    id: f.id,
                    nombre: cliente,
                    titulo: `Factura pendiente: ${cliente}`,
                    detalle: `$${f.total.toFixed(2)} · hace ${dias} días`,
                    fecha: f.fecha,
                };
            }),
        );
    }

    // VET a) Citas de hoy aún por atender.
    private async citasDeHoyVeterinario(usuarioId: string) {
        const citas = await this.prisma.cita.findMany({
            where: {
                usuarioId,
                estado: { in: ESTADOS_ABIERTOS },
                fecha: { gte: inicioDeHoy(), lte: finDeHoy() },
            },
            include: INCLUDE_MASCOTA_Y_PROPIETARIO,
            orderBy: { fecha: 'asc' },
        });

        return this.agrupar(
            {
                tipo: 'cita-hoy',
                severidad: 'info',
                ruta: '/citas',
                resumen: (n) => `Tienes ${n} citas pendientes de atender hoy`,
                maxIndividuales: 5,
            },
            citas.map((c) => ({
                id: c.id,
                nombre: c.mascota.nombre,
                titulo: `Cita hoy ${formatoHora.format(c.fecha)}`,
                detalle: `${c.mascota.nombre} (${c.mascota.cliente.nombre}) · ${c.motivo}`,
                fecha: c.fecha,
            })),
        );
    }

    // VET b) Citas futuras asignadas en las últimas 24 horas; se leen una sola vez.
    private async citasNuevasVeterinario(usuarioId: string) {
        const ahora = new Date();
        const citas = await this.prisma.cita.findMany({
            where: {
                usuarioId,
                estado: { in: ESTADOS_ABIERTOS },
                fecha: { gt: ahora },
                createdAt: { gte: new Date(ahora.getTime() - DIA_MS) },
            },
            include: INCLUDE_MASCOTA_Y_PROPIETARIO,
            orderBy: { fecha: 'asc' },
        });

        return this.agrupar(
            {
                tipo: 'cita-nueva',
                severidad: 'info',
                ruta: '/citas',
                resumen: (n) => `${n} citas nuevas asignadas`,
                maxIndividuales: 5,
                lectura: 'unica',
            },
            citas.map((c) => ({
                id: c.id,
                nombre: c.mascota.nombre,
                titulo: 'Nueva cita asignada',
                detalle: `${c.mascota.nombre} · ${formatoFechaHora.format(c.fecha)} · ${c.motivo}`,
                fecha: c.fecha,
            })),
        );
    }

    // VET c) Citas de días anteriores que siguen sin atender ni cerrar.
    private async citasSinCerrarVeterinario(usuarioId: string) {
        const citas = await this.prisma.cita.findMany({
            where: {
                usuarioId,
                estado: { in: ESTADOS_ABIERTOS },
                fecha: { lt: inicioDeHoy() },
            },
            include: { mascota: { select: { nombre: true } } },
            orderBy: { fecha: 'asc' },
        });

        return this.agrupar(
            {
                tipo: 'cita-sin-cerrar',
                severidad: 'media',
                ruta: '/citas',
                resumen: (n) =>
                    `${n} ${plural(n, 'cita de días anteriores sin cerrar', 'citas de días anteriores sin cerrar')}`,
                maxIndividuales: 0,
            },
            citas.map((c) => ({
                id: c.id,
                nombre: c.mascota.nombre,
                titulo: '',
                detalle: '',
                fecha: c.fecha,
            })),
        );
    }
}
