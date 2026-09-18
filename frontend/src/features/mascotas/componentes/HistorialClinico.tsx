import type { HistorialConsulta } from '../../../api/mascotas.api';
import styles from '../styles/mascotas.module.css';

interface HistorialClinicoProps {
    historial: HistorialConsulta[];
}

export function HistorialClinico({ historial }: HistorialClinicoProps) {
    if (historial.length === 0) {
        return (
            <p className={styles.historialVacio}>
                Esta mascota todavía no tiene consultas registradas.
            </p>
        );
    }

    return (
        <ul className={styles.timeline}>
            {historial.map((h) => {
                const servicios = h.facturas
                    .flatMap((f) => f.detalles)
                    .map((d) => d.servicio?.nombre)
                    .filter((nombre): nombre is string => Boolean(nombre));

                return (
                    <li key={h.id} className={styles.timelineItem}>
                        <div className={styles.timelineDot} />
                        <div className={styles.timelineContent}>
                            <div className={styles.timelineHeader}>
                                <span className={styles.timelineFecha}>
                                    {h.cita
                                        ? new Date(
                                              h.cita.fecha,
                                          ).toLocaleString()
                                        : new Date(
                                              h.createdAt,
                                          ).toLocaleString()}
                                </span>
                                <span className={styles.timelineVet}>
                                    {h.cita?.usuario?.nombre ??
                                        'Veterinario no registrado'}
                                </span>
                            </div>

                            {h.diagnostico && (
                                <p className={styles.timelineText}>
                                    <b>Diagnóstico:</b> {h.diagnostico}
                                </p>
                            )}
                            {h.tratamiento && (
                                <p className={styles.timelineText}>
                                    <b>Tratamiento:</b> {h.tratamiento}
                                </p>
                            )}
                            {h.insumos.length > 0 && (
                                <p className={styles.timelineText}>
                                    <b>Insumos usados:</b>{' '}
                                    {h.insumos
                                        .map(
                                            (i) =>
                                                `${i.insumo.nombre} (x${i.cantidad})`,
                                        )
                                        .join(', ')}
                                </p>
                            )}
                            <p className={styles.timelineText}>
                                <b>Servicio facturado:</b>{' '}
                                {servicios.length > 0
                                    ? servicios.join(', ')
                                    : 'Sin servicio registrado'}
                            </p>
                        </div>
                    </li>
                );
            })}
        </ul>
    );
}
