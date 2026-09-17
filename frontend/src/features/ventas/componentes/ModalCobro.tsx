import { isAxiosError } from 'axios';
import { Modal } from '../../../components/ui/Modal';
import type { Factura } from '../../../api/ventas.api';
import styles from '../styles/ventas.module.css';

const METODOS_PAGO = [
    { value: 'efectivo', label: 'Efectivo' },
    { value: 'tarjeta', label: 'Tarjeta' },
    { value: 'transferencia', label: 'Transferencia' },
];

function extraerMensajeError(error: unknown): string {
    if (isAxiosError(error)) {
        const data = error.response?.data as
            { message?: string | string[] } | undefined;
        if (Array.isArray(data?.message)) return data.message.join(', ');
        if (typeof data?.message === 'string') return data.message;
    }
    return 'Ocurrió un error al procesar la venta.';
}

interface ModalCobroProps {
    isOpen: boolean;
    onClose: () => void;
    total: number;
    metodoPago: string;
    setMetodoPago: (valor: string) => void;
    onConfirmar: () => void;
    isPending: boolean;
    isError: boolean;
    error: unknown;
    factura: Factura | null;
}

export function ModalCobro({
    isOpen,
    onClose,
    total,
    metodoPago,
    setMetodoPago,
    onConfirmar,
    isPending,
    isError,
    error,
    factura,
}: ModalCobroProps) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={factura ? 'Venta registrada' : 'Cobrar venta'}
        >
            {factura ? (
                <div className={styles.exitoBox}>
                    <p className={styles.exitoMensaje}>
                        La venta se registró correctamente.
                    </p>
                    <div className={styles.facturaResumen}>
                        <div className={styles.facturaResumenRow}>
                            <span>Factura</span>
                            <span>{factura.id}</span>
                        </div>
                        <div className={styles.facturaResumenRow}>
                            <span>Método de pago</span>
                            <span>{factura.metodoPago ?? '-'}</span>
                        </div>
                        <div className={styles.facturaResumenRow}>
                            <span>Estado</span>
                            <span>{factura.estado}</span>
                        </div>
                        <div className={styles.facturaResumenTotal}>
                            <span>Total cobrado</span>
                            <span>${factura.total.toFixed(2)}</span>
                        </div>
                    </div>
                    <button
                        type="button"
                        className={styles.submitBtn}
                        onClick={onClose}
                    >
                        Nueva venta
                    </button>
                </div>
            ) : (
                <div className={styles.formGrid}>
                    <div className={styles.totalRow}>
                        <span>Total a cobrar</span>
                        <span className={styles.totalValue}>
                            ${total.toFixed(2)}
                        </span>
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="metodo-pago">Método de pago</label>
                        <select
                            id="metodo-pago"
                            value={metodoPago}
                            onChange={(e) => setMetodoPago(e.target.value)}
                        >
                            {METODOS_PAGO.map((m) => (
                                <option key={m.value} value={m.value}>
                                    {m.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {isError && (
                        <p className={styles.errorMsg}>
                            {extraerMensajeError(error)}
                        </p>
                    )}

                    <button
                        type="button"
                        className={styles.submitBtn}
                        onClick={onConfirmar}
                        disabled={isPending}
                    >
                        {isPending ? 'Procesando...' : 'Confirmar cobro'}
                    </button>
                </div>
            )}
        </Modal>
    );
}
