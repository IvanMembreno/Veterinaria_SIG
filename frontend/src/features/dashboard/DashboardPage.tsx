import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { useDashboard } from './hooks/useDashboard';
import {
    AlertList,
    ChartCard,
    KpiCard,
    DonutChart,
} from './components/DashboardWidgets';
import styles from './styles/dashboard.module.css';

import iconoDinero from '../../assets/decorations/money.svg';
import iconoAsistencia from '../../assets/decorations/people_check.svg';
import iconoAusencia from '../../assets/decorations/people_fail.svg';
import iconoStock from '../../assets/decorations/box.svg';
import iconoVencimiento from '../../assets/decorations/clock.svg';

const tick = { fill: 'var(--color-text-muted)', fontSize: 12 };
const dinero = (valor: unknown) => `$${Number(valor).toFixed(2)}`;

const localTooltipStyle = {
    borderRadius: 10,
    border: '1px solid var(--color-border)',
    boxShadow: 'var(--shadow-card)',
};

export function DashboardPage() {
    const { resumen, isLoading, isError } = useDashboard();

    if (isLoading) {
        return (
            <div className={styles.loaderContainer}>
                <p>Calculando los indicadores de La Garrita Feliz...</p>
            </div>
        );
    }

    if (isError || !resumen) {
        return (
            <div className={styles.loaderContainer}>
                <p>No se pudieron cargar los indicadores. Intenta de nuevo.</p>
            </div>
        );
    }

    const {
        ticketPromedio,
        ocupacionAgenda: agenda,
        ingresosPorMes,
        ingresosPorServicio,
        ingresosPorMetodoPago,
        consultasPorVeterinario,
        mascotasPorEspecie,
        alertasStockBajo,
        alertasVencimiento,
    } = resumen;

    const ingresosMes = ingresosPorMes[ingresosPorMes.length - 1]?.total ?? 0;

    const citasPorEstado = [
        { estado: 'Atendidas', total: agenda.atendidas },
        {
            estado: 'Pendientes',
            total:
                agenda.totalCitas -
                agenda.atendidas -
                agenda.noAsistio -
                agenda.canceladas,
        },
        { estado: 'Canceladas', total: agenda.canceladas },
        { estado: 'No asistió', total: agenda.noAsistio },
    ].filter((e) => e.total > 0);

    const fechaHoy = new Date().toLocaleDateString('es', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    });

    return (
        <div className={styles.pageWrapper}>
            <header className={styles.pageHeader}>
                <div>
                    <span className={styles.subBrand}>
                        VETERINARIA LA GARRITA FELIZ
                    </span>
                    <h1 className={styles.mainTitle}>Panel Gerencial</h1>
                    <p className={styles.subtitle}>
                        Resumen operativo y financiero de la clínica.
                    </p>
                </div>
                <div className={styles.dateBadge}>{fechaHoy}</div>
            </header>

            <div className={styles.kpiGrid}>
                <KpiCard
                    icon={iconoDinero}
                    titulo="Ingresos del mes"
                    valor={dinero(ingresosMes)}
                    sub="facturas pagadas"
                />
                <KpiCard
                    icon={iconoDinero}
                    titulo="Ticket promedio"
                    valor={dinero(ticketPromedio.ticketPromedio)}
                    sub={`${ticketPromedio.totalFacturas} facturas pagadas`}
                />
                <KpiCard
                    icon={iconoAsistencia}
                    titulo="Asistencia"
                    valor={`${agenda.tasaAsistencia}%`}
                    sub={`${agenda.atendidas} de ${agenda.totalCitas} citas`}
                />
                <KpiCard
                    icon={iconoAusencia}
                    titulo="Ausentismo"
                    valor={`${agenda.tasaAusentismo}%`}
                    sub={`${agenda.noAsistio} no asistieron`}
                />
                <KpiCard
                    icon={iconoStock}
                    titulo="Stock bajo"
                    valor={alertasStockBajo.length}
                    sub="insumos bajo mínimo"
                    alerta={alertasStockBajo.length > 0}
                />
                <KpiCard
                    icon={iconoVencimiento}
                    titulo="Vencimientos"
                    valor={alertasVencimiento.length}
                    sub="vencidos o por vencer"
                    alerta={alertasVencimiento.length > 0}
                />
            </div>

            <div className={styles.chartsGrid}>
                <ChartCard
                    title="Ingresos de los últimos 6 meses"
                    wide
                    isEmpty={ingresosPorMes.every((m) => m.total === 0)}
                >
                    <AreaChart data={ingresosPorMes}>
                        <defs>
                            <linearGradient
                                id="areaIngresos"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    offset="5%"
                                    stopColor="var(--chart-1)"
                                    stopOpacity={0.35}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="var(--chart-1)"
                                    stopOpacity={0}
                                />
                            </linearGradient>
                        </defs>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="var(--color-border)"
                            vertical={false}
                        />
                        <XAxis
                            dataKey="mes"
                            tick={tick}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis tick={tick} axisLine={false} tickLine={false} />
                        <Tooltip
                            contentStyle={localTooltipStyle}
                            formatter={dinero}
                        />
                        <Area
                            type="monotone"
                            dataKey="total"
                            stroke="var(--chart-1)"
                            strokeWidth={2.5}
                            fill="url(#areaIngresos)"
                        />
                    </AreaChart>
                </ChartCard>

                <ChartCard
                    title="Estado de las citas"
                    isEmpty={citasPorEstado.length === 0}
                >
                    <DonutChart data={citasPorEstado} nameKey="estado" valueKey="total" />
                </ChartCard>

                <ChartCard
                    title="Ingresos por servicio"
                    wide
                    isEmpty={ingresosPorServicio.length === 0}
                >
                    <BarChart
                        data={ingresosPorServicio.slice(0, 6)}
                        layout="vertical"
                    >
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="var(--color-border)"
                            horizontal={false}
                        />
                        <XAxis type="number" hide />
                        <YAxis
                            type="category"
                            dataKey="servicio"
                            width={140}
                            tick={tick}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip
                            contentStyle={localTooltipStyle}
                            formatter={dinero}
                            cursor={{ fill: 'var(--color-surface-alt)' }}
                        />
                        <Bar
                            dataKey="totalIngresos"
                            fill="var(--chart-1)"
                            radius={[0, 6, 6, 0]}
                        />
                    </BarChart>
                </ChartCard>

                <ChartCard
                    title="Ingresos por método de pago"
                    isEmpty={ingresosPorMetodoPago.length === 0}
                >
                    <DonutChart data={ingresosPorMetodoPago} nameKey="metodo" valueKey="total" prefix="$" />
                </ChartCard>

                <ChartCard
                    title="Consultas por veterinario"
                    wide
                    isEmpty={consultasPorVeterinario.length === 0}
                >
                    <BarChart data={consultasPorVeterinario}>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="var(--color-border)"
                            vertical={false}
                        />
                        <XAxis
                            dataKey="nombre"
                            tick={tick}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            allowDecimals={false}
                            tick={tick}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip
                            contentStyle={localTooltipStyle}
                            cursor={{ fill: 'var(--color-surface-alt)' }}
                        />
                        <Bar
                            dataKey="total"
                            fill="var(--chart-2)"
                            radius={[6, 6, 0, 0]}
                        />
                    </BarChart>
                </ChartCard>

                <ChartCard
                    title="Mascotas por especie"
                    isEmpty={mascotasPorEspecie.length === 0}
                >
                    <DonutChart data={mascotasPorEspecie} nameKey="especie" valueKey="total" />
                </ChartCard>
            </div>

            <div className={styles.alertsGrid}>
                <AlertList
                    title="Insumos con stock bajo"
                    icon={iconoStock}
                    tone="danger"
                    emptyText="Todo en orden: ningún insumo bajo el mínimo."
                    items={alertasStockBajo.map((a) => ({
                        id: a.id,
                        titulo: a.nombre,
                        detalle: `${a.stock} unidades (mínimo ${a.stockMinimo})`,
                    }))}
                />
                <AlertList
                    title="Vencidos o por vencer"
                    icon={iconoVencimiento}
                    tone="warning"
                    emptyText="Todo en orden: sin vencimientos en 30 días."
                    items={alertasVencimiento.map((a) => {
                        const fecha = new Date(a.fechaVenc);
                        const vencido = fecha < new Date();
                        return {
                            id: a.id,
                            titulo: `${a.nombre}${a.lote ? ` · Lote ${a.lote}` : ''}`,
                            detalle: `${vencido ? 'Venció' : 'Vence'} el ${fecha.toLocaleDateString()} · ${a.stock} unidades`,
                        };
                    })}
                />
            </div>
        </div>
    );
}
