import type { ReactElement } from 'react';
import {
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
} from 'recharts';
import styles from '../styles/dashboard.module.css';

const COLORES_DONA = [
    'var(--chart-1)',
    'var(--chart-2)',
    'var(--chart-3)',
    'var(--chart-4)',
    'var(--chart-5)',
];

const tooltipStyle = {
    borderRadius: 10,
    border: '1px solid var(--color-border)',
    boxShadow: 'var(--shadow-card)',
};

interface KpiCardProps {
    icon: string;
    titulo: string;
    valor: string | number;
    sub?: string;
    alerta?: boolean;
}

export function KpiCard({ icon, titulo, valor, sub, alerta }: KpiCardProps) {
    return (
        <div
            className={`${styles.kpiCard} ${alerta ? styles.kpiCardAlert : ''}`}
        >
            <div>
                <p className={styles.kpiLabel}>{titulo}</p>
                <p className={styles.kpiValue}>{valor}</p>
                {sub && <p className={styles.kpiSub}>{sub}</p>}
            </div>
            <div className={styles.kpiIconWrap}>
                <img src={icon} alt="" className={styles.kpiIcon} />
            </div>
        </div>
    );
}

interface ChartCardProps {
    title: string;
    isEmpty: boolean;
    wide?: boolean;
    children: ReactElement;
}

export function ChartCard({ title, isEmpty, wide, children }: ChartCardProps) {
    return (
        <div className={`${styles.chartCard} ${wide ? styles.wide : ''}`}>
            <h4 className={styles.chartTitle}>{title}</h4>
            <div className={styles.chartArea}>
                {isEmpty ? (
                    <p className={styles.chartEmpty}>
                        Aún no hay datos para mostrar.
                    </p>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        {children}
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}

interface DonutChartProps {
    data: object[];
    nameKey: string;
    valueKey: string;
    prefix?: string;
}

export function DonutChart({
    data,
    nameKey,
    valueKey,
    prefix = '',
}: DonutChartProps) {
    return (
        <PieChart>
            <Pie
                data={data}
                nameKey={nameKey}
                dataKey={valueKey}
                innerRadius="55%"
                outerRadius="80%"
                paddingAngle={3}
                stroke="none"
            >
                {data.map((_, i) => (
                    <Cell
                        key={i}
                        fill={COLORES_DONA[i % COLORES_DONA.length]}
                    />
                ))}
            </Pie>
            <Tooltip
                contentStyle={tooltipStyle}
                formatter={(valor) => `${prefix}${valor}`}
            />
            <Legend iconType="circle" />
        </PieChart>
    );
}

interface AlertItem {
    id: string;
    titulo: string;
    detalle: string;
}

interface AlertListProps {
    title: string;
    icon: string;
    items: AlertItem[];
    emptyText: string;
    tone: 'danger' | 'warning';
}

export function AlertList({
    title,
    icon,
    items,
    emptyText,
    tone,
}: AlertListProps) {
    return (
        <section className={`${styles.alertCard} ${styles[tone]}`}>
            <div className={styles.alertHeader}>
                <img src={icon} alt="" className={styles.alertIcon} />
                <h4 className={styles.alertTitle}>{title}</h4>
                <span className={styles.alertCount}>{items.length}</span>
            </div>
            {items.length === 0 ? (
                <p className={styles.alertEmpty}>{emptyText}</p>
            ) : (
                <ul className={styles.alertList}>
                    {items.map((i) => (
                        <li key={i.id} className={styles.alertItem}>
                            <span className={styles.alertName}>{i.titulo}</span>
                            <span className={styles.alertDetail}>
                                {i.detalle}
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}
