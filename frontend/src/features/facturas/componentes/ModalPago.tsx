import { Modal } from '../../../components/ui/Modal';
import { getErrorMessage } from '../../../utils/getErrorMessage';
import styles from '../styles/facturas.module.css';

const METODOS_PAGO = [
    { value: 'efectivo', label: 'Efectivo' },
    { value: 'tarjeta', label: 'Tarjeta' },
    { value: 'transferencia', label: 'Transferencia' },
];

interface ModalPagoProps {
    isOpen: boolean;
    onClose: () => void;
    metodoPago: string;
    setMetodoPago: (valor: string) => void;
    onConfirmar: () => void;
    isPending: boolean;
    isError: boolean;
    error: unknown;
}

export function ModalPago({
    isOpen,
    onClose,
    metodoPago,
    setMetodoPago,
    onConfirmar,
    isPending,
    isError,
    error,
}: ModalPagoProps) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Registrar Pago">
            <div className={styles.formGrid}>
                <div className={styles.field}>
                    <label htmlFor="metodo-pago-factura">Método de pago</label>
                    <select
                        id="metodo-pago-factura"
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
                        {getErrorMessage(
                            error,
                            'No se pudo registrar el pago.',
                        )}
                    </p>
                )}

                <button
                    type="button"
                    className={styles.submitBtn}
                    onClick={onConfirmar}
                    disabled={isPending}
                >
                    {isPending ? 'Procesando...' : 'Confirmar pago'}
                </button>
            </div>
        </Modal>
    );
}
