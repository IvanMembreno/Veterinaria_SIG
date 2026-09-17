import type { Insumo } from '../../../api/inventario.api';
import type { Servicio } from '../../../api/servicios.api';
import styles from '../styles/ventas.module.css';

interface BuscadorProductosProps {
    busqueda: string;
    setBusqueda: (valor: string) => void;
    productosFiltrados: Insumo[];
    serviciosFiltrados: Servicio[];
    onAgregarProducto: (insumo: Insumo) => void;
    onAgregarServicio: (servicio: Servicio) => void;
}

export function BuscadorProductos({
    busqueda,
    setBusqueda,
    productosFiltrados,
    serviciosFiltrados,
    onAgregarProducto,
    onAgregarServicio,
}: BuscadorProductosProps) {
    const hayBusqueda = busqueda.trim().length > 0;
    const sinResultados =
        hayBusqueda &&
        productosFiltrados.length === 0 &&
        serviciosFiltrados.length === 0;

    return (
        <div className={styles.card}>
            <div className={styles.buscadorHeader}>
                <input
                    type="text"
                    placeholder="Buscar producto o servicio por nombre..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className={styles.buscadorInput}
                    autoFocus
                />
            </div>

            {!hayBusqueda && (
                <p className={styles.buscadorHint}>
                    Escribe el nombre de un producto o servicio para agregarlo a
                    la venta.
                </p>
            )}

            {sinResultados && (
                <p className={styles.buscadorHint}>
                    No se encontraron resultados para &quot;{busqueda}&quot;.
                </p>
            )}

            {serviciosFiltrados.length > 0 && (
                <div className={styles.resultGroup}>
                    <span className={styles.resultGroupTitle}>Servicios</span>
                    <ul className={styles.resultList}>
                        {serviciosFiltrados.map((s) => (
                            <li key={s.id} className={styles.resultItem}>
                                <div>
                                    <span className={styles.resultName}>
                                        {s.nombre}
                                    </span>
                                    <span className={styles.resultPrice}>
                                        ${s.precio.toFixed(2)}
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    className={styles.addBtn}
                                    onClick={() => onAgregarServicio(s)}
                                >
                                    + Agregar
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {productosFiltrados.length > 0 && (
                <div className={styles.resultGroup}>
                    <span className={styles.resultGroupTitle}>Productos</span>
                    <ul className={styles.resultList}>
                        {productosFiltrados.map((i) => (
                            <li key={i.id} className={styles.resultItem}>
                                <div>
                                    <span className={styles.resultName}>
                                        {i.nombre}
                                    </span>
                                    <span className={styles.resultPrice}>
                                        ${i.precioUnit.toFixed(2)}
                                    </span>
                                    <span
                                        className={
                                            i.stock <= 0
                                                ? styles.resultStockAgotado
                                                : styles.resultStock
                                        }
                                    >
                                        {i.stock <= 0
                                            ? 'Sin stock'
                                            : `Stock: ${i.stock}`}
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    className={styles.addBtn}
                                    disabled={i.stock <= 0}
                                    onClick={() => onAgregarProducto(i)}
                                >
                                    + Agregar
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
