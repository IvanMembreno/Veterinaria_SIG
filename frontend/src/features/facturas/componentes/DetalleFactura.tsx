import { clienteDeFactura, type Factura } from '../../../api/facturas.api';
import styles from '../styles/facturas.module.css';

interface DetalleFacturaProps {
    factura?: Factura;
    isLoading: boolean;
    onPagar: () => void;
}

export function DetalleFactura({
    factura,
    isLoading,
    onPagar,
}: DetalleFacturaProps) {
    if (isLoading || !factura) {
        return <p className={styles.detalleHint}>Cargando factura...</p>;
    }

    const cliente = clienteDeFactura(factura);
    const consulta = factura.consulta;

    return (
        <div className={styles.detalleBox}>
            <div className={styles.detalleResumen}>
                <div className={styles.detalleResumenRow}>
                    <span>Fecha</span>
                    <span>{new Date(factura.fecha).toLocaleString()}</span>
                </div>
                <div className={styles.detalleResumenRow}>
                    <span>Cliente</span>
                    <span>
                        {cliente ?? 'Venta directa (sin cliente asociado)'}
                    </span>
                </div>
                <div className={styles.detalleResumenRow}>
                    <span>Estado</span>
                    <span
                        className={
                            factura.estado === 'PAGADA'
                                ? styles.estadoPagada
                                : styles.estadoPendiente
                        }
                    >
                        {factura.estado}
                    </span>
                </div>
                {factura.metodoPago && (
                    <div className={styles.detalleResumenRow}>
                        <span>Método de pago</span>
                        <span>{factura.metodoPago}</span>
                    </div>
                )}
            </div>

            <div className={styles.detalleSeccion}>
                <span className={styles.detalleSeccionTitle}>
                    Detalle de la factura
                </span>
                <ul className={styles.detalleList}>
                    {factura.detalles.map((d) => (
                        <li key={d.id} className={styles.detalleItem}>
                            <span className={styles.detalleItemNombre}>
                                {d.servicio?.nombre ??
                                    d.insumo?.nombre ??
                                    'Ítem'}
                            </span>
                            <span className={styles.detalleItemCantidad}>
                                x{d.cantidad}
                            </span>
                            <span className={styles.detalleItemSubtotal}>
                                ${(d.precio * d.cantidad).toFixed(2)}
                            </span>
                        </li>
                    ))}
                </ul>
                <div className={styles.detalleTotalRow}>
                    <span>Total</span>
                    <span>${factura.total.toFixed(2)}</span>
                </div>
            </div>

            {consulta && (
                <div className={styles.detalleSeccion}>
                    <span className={styles.detalleSeccionTitle}>
                        Consulta asociada
                    </span>
                    <div className={styles.consultaResumen}>
                        <p>
                            <b>Motivo:</b> {consulta.cita?.motivo ?? '-'}
                        </p>
                        {consulta.diagnostico && (
                            <p>
                                <b>Diagnóstico:</b> {consulta.diagnostico}
                            </p>
                        )}
                        {consulta.tratamiento && (
                            <p>
                                <b>Tratamiento:</b> {consulta.tratamiento}
                            </p>
                        )}
                        {consulta.cita && (
                            <p className={styles.consultaFecha}>
                                {new Date(consulta.cita.fecha).toLocaleString()}
                            </p>
                        )}
                    </div>
                </div>
            )}

            {factura.estado === 'PENDIENTE' && (
                <button
                    type="button"
                    className={styles.submitBtn}
                    onClick={onPagar}
                >
                    Marcar como pagada
                </button>
            )}
        </div>
    );
}
