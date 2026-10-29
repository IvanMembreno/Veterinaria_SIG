import type { CartItem } from '../hooks/useVentas';
import styles from '../styles/ventas.module.css';
import basurero from '../../../assets/actions/trash.svg';

interface CarritoProps {
    carrito: CartItem[];
    total: number;
    onActualizarCantidad: (key: string, cantidad: number) => void;
    onQuitar: (key: string) => void;
    onCobrar: () => void;
}

export function Carrito({
    carrito,
    total,
    onActualizarCantidad,
    onQuitar,
    onCobrar,
}: CarritoProps) {
    return (
        <div className={styles.card}>
            <div className={styles.carritoHeader}>
                <h3 className={styles.carritoTitle}>Carrito</h3>
                <span className={styles.statsBadge}>
                    {carrito.length} {carrito.length === 1 ? 'línea' : 'líneas'}
                </span>
            </div>

            {carrito.length === 0 ? (
                <p className={styles.emptyState}>
                    Agrega productos o servicios desde el buscador para iniciar
                    la venta.
                </p>
            ) : (
                <ul className={styles.carritoList}>
                    {carrito.map((item) => (
                        <li key={item.key} className={styles.carritoItem}>
                            <div className={styles.carritoItemInfo}>
                                <span className={styles.carritoItemNombre}>
                                    {item.nombre}
                                </span>
                                <span className={styles.carritoItemPrecio}>
                                    ${item.precio.toFixed(2)} c/u
                                </span>
                            </div>
                            <input
                                type="number"
                                min={1}
                                max={item.stockDisponible}
                                value={item.cantidad}
                                onChange={(e) =>
                                    onActualizarCantidad(
                                        item.key,
                                        Number(e.target.value),
                                    )
                                }
                                className={styles.cantidadInput}
                            />
                            <span className={styles.carritoSubtotal}>
                                ${(item.precio * item.cantidad).toFixed(2)}
                            </span>
                            <button
                                type="button"
                                className={styles.removeBtn}
                                onClick={() => onQuitar(item.key)}
                                title="Quitar del carrito"
                            >
                                <img src={basurero} alt="" />
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            <div className={styles.totalRow}>
                <span>Total</span>
                <span className={styles.totalValue}>${total.toFixed(2)}</span>
            </div>

            <button
                type="button"
                className={styles.cobrarBtn}
                disabled={carrito.length === 0}
                onClick={onCobrar}
            >
                Cobrar
            </button>
        </div>
    );
}
