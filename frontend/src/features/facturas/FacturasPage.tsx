import { useFacturas } from './hooks/useFacturas';
import { FiltrosFacturas } from './componentes/FiltrosFacturas';
import { DetalleFactura } from './componentes/DetalleFactura';
import { ModalPago } from './componentes/ModalPago';
import { clienteDeFactura, type Factura } from '../../api/facturas.api';
import { Modal } from '../../components/ui/Modal';
import styles from './styles/facturas.module.css';

export function FacturasPage() {
    const {
        facturas,
        isLoading,
        clientes,
        filtros,
        setFiltros,
        limpiarFiltros,
        facturaSeleccionada,
        isLoadingDetalle,
        verDetalle,
        cerrarDetalle,
        facturaAPagarId,
        metodoPago,
        setMetodoPago,
        abrirPago,
        cerrarPago,
        confirmarPago,
        pagarMutation,
    } = useFacturas();

    if (isLoading) {
        return (
            <div className={styles.loaderContainer}>
                <p>Consultando la facturación de La Garrita Feliz...</p>
            </div>
        );
    }

    return (
        <div className={styles.pageWrapper}>
            <header className={styles.pageHeader}>
                <div>
                    <span className={styles.subBrand}>
                        VETERINARIA LA GARRITA FELIZ
                    </span>
                    <h1 className={styles.mainTitle}>Facturación</h1>
                    <p className={styles.subtitle}>
                        Consulta el historial de facturas y registra los pagos
                        pendientes.
                    </p>
                </div>
                <div className={styles.headerActions}>
                    <div className={styles.statsBadge}>
                        Facturas: <b>{facturas?.length || 0}</b>
                    </div>
                </div>
            </header>

            <FiltrosFacturas
                filtros={filtros}
                setFiltros={setFiltros}
                clientes={clientes}
                onLimpiar={limpiarFiltros}
            />

            <div className={styles.card}>
                <table className={styles.facturasTable}>
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Cliente</th>
                            <th>Total</th>
                            <th>Estado</th>
                            <th className={styles.textCenter}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {facturas && facturas.length > 0 ? (
                            facturas.map((f: Factura) => (
                                <tr
                                    key={f.id}
                                    className={styles.tableRow}
                                    onClick={() => verDetalle(f.id)}
                                >
                                    <td className={styles.dateCell}>
                                        {new Date(f.fecha).toLocaleDateString()}
                                    </td>
                                    <td className={styles.clientCell}>
                                        {clienteDeFactura(f) ?? (
                                            <span className={styles.noData}>
                                                Venta directa
                                            </span>
                                        )}
                                    </td>
                                    <td className={styles.totalCell}>
                                        ${f.total.toFixed(2)}
                                    </td>
                                    <td>
                                        <span
                                            className={
                                                f.estado === 'PAGADA'
                                                    ? styles.estadoPagada
                                                    : styles.estadoPendiente
                                            }
                                        >
                                            {f.estado}
                                        </span>
                                    </td>
                                    <td className={styles.actionsCell}>
                                        {f.estado === 'PENDIENTE' ? (
                                            <button
                                                className={styles.payBtn}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    abrirPago(f.id);
                                                }}
                                            >
                                                Marcar como pagada
                                            </button>
                                        ) : (
                                            <span
                                                className={styles.emptyActions}
                                            >
                                                -
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className={styles.emptyState}>
                                    No hay facturas que coincidan con los
                                    filtros aplicados.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Modal
                isOpen={!!facturaSeleccionada || isLoadingDetalle}
                onClose={cerrarDetalle}
                title="Detalle de Factura"
            >
                <DetalleFactura
                    factura={facturaSeleccionada}
                    isLoading={isLoadingDetalle}
                    onPagar={() => {
                        if (facturaSeleccionada)
                            abrirPago(facturaSeleccionada.id);
                    }}
                />
            </Modal>

            <ModalPago
                isOpen={!!facturaAPagarId}
                onClose={cerrarPago}
                metodoPago={metodoPago}
                setMetodoPago={setMetodoPago}
                onConfirmar={confirmarPago}
                isPending={pagarMutation.isPending}
                isError={pagarMutation.isError}
                error={pagarMutation.error}
            />
        </div>
    );
}
