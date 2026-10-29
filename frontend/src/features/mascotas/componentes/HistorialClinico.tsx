import type {
    HistorialConsulta,
    HistorialFactura,
} from '../../../api/mascotas.api';
import styles from '../styles/mascotas.module.css';

// El backend ya devuelve metodoPago en las facturas del historial.
type FacturaHistorial = HistorialFactura & { metodoPago?: string | null };

interface HistorialClinicoProps {
    historial: HistorialConsulta[];
}

const fechaConsulta = (h: HistorialConsulta) => h.cita?.fecha ?? h.createdAt;

const capitalizar = (texto: string) =>
    texto.charAt(0).toUpperCase() + texto.slice(1);

export function HistorialClinico({ historial }: HistorialClinicoProps) {
    if (historial.length === 0) {
        return (
            <div className={styles.historialVacio}>
                <p className={styles.historialVacioTitulo}>
                    Aún no hay consultas registradas
                </p>
                <p>
                    Cuando se atienda una cita de esta mascota, el diagnóstico,
                    el tratamiento y lo facturado aparecerán aquí.
                </p>
            </div>
        );
    }

    // Más reciente primero.
    const consultas = [...historial].sort(
        (a, b) =>
            new Date(fechaConsulta(b)).getTime() -
            new Date(fechaConsulta(a)).getTime(),
    );

    return (
        <ul className={styles.timeline}>
            {consultas.map((h) => {
                const facturas = h.facturas as FacturaHistorial[];
                const servicios = facturas
                    .flatMap((f) => f.detalles)
                    .filter((d) => d.servicio);

                return (
                    <li key={h.id} className={styles.timelineItem}>
                        <div className={styles.timelineDot} />
                        <article className={styles.timelineContent}>
                            <div className={styles.timelineHeader}>
                                <span className={styles.timelineFecha}>
                                    {new Date(
                                        fechaConsulta(h),
                                    ).toLocaleString()}
                                </span>
                                <span className={styles.timelineVet}>
                                    {h.cita?.usuario?.nombre ??
                                        'Veterinario no registrado'}
                                </span>
                            </div>

                            {(h.peso != null || h.temperatura != null) && (
                                <div className={styles.timelineSignos}>
                                    {h.peso != null && (
                                        <span>
                                            Peso: <b>{h.peso} kg</b>
                                        </span>
                                    )}
                                    {h.temperatura != null && (
                                        <span>
                                            Temperatura:{' '}
                                            <b>{h.temperatura} °C</b>
                                        </span>
                                    )}
                                </div>
                            )}

                            <Seccion titulo="Motivo">
                                {h.cita?.motivo || 'Sin motivo registrado'}
                            </Seccion>
                            {h.diagnostico && (
                                <Seccion titulo="Diagnóstico">
                                    {h.diagnostico}
                                </Seccion>
                            )}
                            {h.tratamiento && (
                                <Seccion titulo="Tratamiento">
                                    {h.tratamiento}
                                </Seccion>
                            )}
                            {h.observaciones && (
                                <Seccion titulo="Observaciones">
                                    {h.observaciones}
                                </Seccion>
                            )}
                            {h.insumos.length > 0 && (
                                <Seccion titulo="Insumos">
                                    <ul className={styles.timelineLista}>
                                        {h.insumos.map((i) => (
                                            <li key={i.id}>
                                                {i.insumo.nombre} (x
                                                {i.cantidad})
                                            </li>
                                        ))}
                                    </ul>
                                </Seccion>
                            )}
                            <Seccion titulo="Servicios facturados">
                                {servicios.length > 0 ? (
                                    <ul className={styles.timelineLista}>
                                        {servicios.map((d) => (
                                            <li key={d.id}>
                                                {d.servicio?.nombre}
                                                {d.cantidad > 1 &&
                                                    ` (x${d.cantidad})`}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    'Sin servicio registrado'
                                )}
                            </Seccion>

                            {facturas.map((f) => (
                                <div
                                    key={f.id}
                                    className={styles.timelineFactura}
                                >
                                    <span>
                                        Factura: <b>${f.total.toFixed(2)}</b>
                                    </span>
                                    <span
                                        className={`${styles.sexBadge} ${
                                            f.estado === 'PAGADA'
                                                ? styles.facturaPagada
                                                : styles.facturaPendiente
                                        }`}
                                    >
                                        {f.estado}
                                    </span>
                                    {f.metodoPago && (
                                        <span>
                                            Método de pago:{' '}
                                            {capitalizar(f.metodoPago)}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </article>
                    </li>
                );
            })}
        </ul>
    );
}

function Seccion({
    titulo,
    children,
}: {
    titulo: string;
    children: React.ReactNode;
}) {
    return (
        <section className={styles.timelineSeccion}>
            <span className={styles.timelineSeccionTitulo}>{titulo}</span>
            <div className={styles.timelineText}>{children}</div>
        </section>
    );
}
