import { useQuery } from '@tanstack/react-query';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from 'recharts';
import { getResumenDashboard } from '../../api/dashboard.api';

interface AlertaStock {
    nombre: string;
    stock: number;
    stockMinimo: number;
}

export function DashboardPage() {
    const { data, isLoading } = useQuery({
        queryKey: ['dashboard'],
        queryFn: getResumenDashboard,
    });

    if (isLoading) return <p>Cargando dashboard...</p>;
    if (!data) return null;

    const {
        ingresosPorServicio,
        consultasPorVeterinario,
        ticketPromedio,
        ocupacionAgenda,
        alertasStockBajo,
    } = data;

    return (
        <div>
            <h2>Dashboard gerencial</h2>

            <div
                style={{
                    display: 'flex',
                    gap: 16,
                    marginBottom: 24,
                    flexWrap: 'wrap',
                }}
            >
                <KpiCard
                    titulo="Ticket promedio"
                    valor={`$${ticketPromedio.ticketPromedio}`}
                    sub={`${ticketPromedio.totalFacturas} facturas`}
                />
                <KpiCard
                    titulo="Tasa de asistencia"
                    valor={`${ocupacionAgenda.tasaAsistencia}%`}
                    sub={`${ocupacionAgenda.atendidas} de ${ocupacionAgenda.totalCitas} citas`}
                />
                <KpiCard
                    titulo="Ausentismo"
                    valor={`${ocupacionAgenda.tasaAusentismo}%`}
                    sub={`${ocupacionAgenda.noAsistio} no-shows`}
                />
                <KpiCard
                    titulo="Alertas de stock"
                    valor={alertasStockBajo.length}
                    sub="insumos bajo mínimo"
                    alerta={alertasStockBajo.length > 0}
                />
            </div>

            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                <div style={{ width: 450, height: 300 }}>
                    <h4>Ingresos por servicio</h4>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={ingresosPorServicio}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="servicio" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="totalIngresos" fill="#4f46e5" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div style={{ width: 450, height: 300 }}>
                    <h4>Consultas por veterinario</h4>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={consultasPorVeterinario}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="nombre" />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Bar dataKey="total" fill="#16a34a" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {alertasStockBajo.length > 0 && (
                <div style={{ marginTop: 24 }}>
                    <h4>⚠ Insumos con stock bajo</h4>
                    <ul>
                        {alertasStockBajo.map((a: AlertaStock) => (
                            <li key={a.nombre}>
                                {a.nombre}: {a.stock} unidades (mínimo{' '}
                                {a.stockMinimo})
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

function KpiCard({
    titulo,
    valor,
    sub,
    alerta,
}: {
    titulo: string;
    valor: string | number;
    sub?: string;
    alerta?: boolean;
}) {
    return (
        <div
            style={{
                border: '1px solid #ccc',
                borderRadius: 8,
                padding: 16,
                width: 180,
                background: alerta ? '#fee2e2' : 'white',
            }}
        >
            <p style={{ margin: 0, fontSize: 12, color: '#666' }}>{titulo}</p>
            <p style={{ margin: '4px 0', fontSize: 24, fontWeight: 'bold' }}>
                {valor}
            </p>
            {sub && (
                <p style={{ margin: 0, fontSize: 11, color: '#999' }}>{sub}</p>
            )}
        </div>
    );
}
