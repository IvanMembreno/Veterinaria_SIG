import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from 'recharts';
import { useDashboard, type AlertaStock } from './hooks/useDashboard';
import styles from './styles/dashboard.module.css';

import ticket_promedio from "../../assets/decorations/money.svg";
import tasa_asistencia from "../../assets/decorations/people_check.svg";
import tasa_ausencia from "../../assets/decorations/people_fail.svg";
import alerta_stock from "../../assets/decorations/box.svg";

export function DashboardPage() {
    const {
        ingresosPorServicio,
        consultasPorVeterinario,
        ticketPromedio,
        ocupacionAgenda,
        alertasStockBajo,
        isLoading,
        hasData,
    } = useDashboard();

    if (isLoading) {
        return (
            <div className={styles.loaderContainer}>
                <p>Calculando los indicadores de La Garrita Feliz...</p>
            </div>
        );
    }

    if (!hasData || !ticketPromedio || !ocupacionAgenda) return null;

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
            </header>

            <div className={styles.kpiGrid}>
                <KpiCard
                    icon={ticket_promedio}
                    titulo="Ticket promedio"
                    valor={`$${ticketPromedio.ticketPromedio}`}
                    sub={`${ticketPromedio.totalFacturas} facturas`}
                />
                <KpiCard
                    icon={tasa_asistencia}
                    titulo="Tasa de asistencia"
                    valor={`${ocupacionAgenda.tasaAsistencia}%`}
                    sub={`${ocupacionAgenda.atendidas} de ${ocupacionAgenda.totalCitas} citas`}
                />
                <KpiCard
                    icon={tasa_ausencia}
                    titulo="Ausentismo"
                    valor={`${ocupacionAgenda.tasaAusentismo}%`}
                    sub={`${ocupacionAgenda.noAsistio} no-shows`}
                />
                <KpiCard
                    icon={alerta_stock}
                    titulo="Alertas de stock"
                    valor={alertasStockBajo?.length ?? 0}
                    sub="insumos bajo mínimo"
                    alerta={(alertasStockBajo?.length ?? 0) > 0}
                />
            </div>

            <div className={styles.chartsGrid}>
                <div className={styles.chartCard}>
                    <h4 className={styles.chartTitle}>Ingresos por servicio</h4>
                    <div className={styles.chartArea}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={ingresosPorServicio}>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="#e9ecef"
                                />
                                <XAxis
                                    dataKey="servicio"
                                    tick={{ fill: '#6c757d', fontSize: 12 }}
                                />
                                <YAxis
                                    tick={{ fill: '#6c757d', fontSize: 12 }}
                                />
                                <Tooltip />
                                <Bar
                                    dataKey="totalIngresos"
                                    fill="#2d6a4f"
                                    radius={[6, 6, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className={styles.chartCard}>
                    <h4 className={styles.chartTitle}>
                        Consultas por veterinario
                    </h4>
                    <div className={styles.chartArea}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={consultasPorVeterinario}>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="#e9ecef"
                                />
                                <XAxis
                                    dataKey="nombre"
                                    tick={{ fill: '#6c757d', fontSize: 12 }}
                                />
                                <YAxis
                                    allowDecimals={false}
                                    tick={{ fill: '#6c757d', fontSize: 12 }}
                                />
                                <Tooltip />
                                <Bar
                                    dataKey="total"
                                    fill="#52b788"
                                    radius={[6, 6, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {alertasStockBajo && alertasStockBajo.length > 0 && (
                <section className={styles.alertSection}>
                    <h4 className={styles.alertTitle}>
                        <span className={styles.alertIcon}>⚠️</span>
                        Insumos con stock bajo
                    </h4>
                    <ul className={styles.alertList}>
                        {alertasStockBajo.map((a: AlertaStock) => (
                            <li key={a.nombre} className={styles.alertItem}>
                                <span className={styles.alertName}>
                                    {a.nombre}
                                </span>
                                <span className={styles.alertDetail}>
                                    {a.stock} unidades (mínimo {a.stockMinimo})
                                </span>
                            </li>
                        ))}
                    </ul>
                </section>
            )}
        </div>
    );
}

interface KpiCardProps {
    icon: string;
    titulo: string;
    valor: string | number;
    sub?: string;
    alerta?: boolean;
}

function KpiCard({ icon, titulo, valor, sub, alerta }: KpiCardProps) {
    return (
        <div
            className={`${styles.kpiCard} ${alerta ? styles.kpiCardAlert : ''}`}
        >
            <img src={icon} alt="" className={styles.kpiIcon} />
            <p className={styles.kpiLabel}>{titulo}</p>
            <p className={styles.kpiValue}>{valor}</p>
            {sub && <p className={styles.kpiSub}>{sub}</p>}
        </div>
    );
}
