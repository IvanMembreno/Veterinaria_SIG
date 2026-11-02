import { useMemo, useState } from 'react';
import type { Insumo } from '../../../api/inventario.api';
import type { Servicio } from '../../../api/servicios.api';
import { estaVencido } from '../../../utils/vencimiento';
import styles from '../styles/ventas.module.css';

const TAMANO_PAGINA = 12;

type Pestana = 'todos' | 'productos' | 'servicios';

const PESTANAS: { valor: Pestana; label: string }[] = [
    { valor: 'todos', label: 'Todos' },
    { valor: 'productos', label: 'Productos' },
    { valor: 'servicios', label: 'Servicios' },
];

type ItemCatalogo =
    | { tipo: 'producto'; key: string; insumo: Insumo }
    | { tipo: 'servicio'; key: string; servicio: Servicio };

const nombreDe = (item: ItemCatalogo) =>
    item.tipo === 'producto' ? item.insumo.nombre : item.servicio.nombre;

// Motivo por el que un producto no se puede agregar al carrito, o null si está disponible.
const motivoNoDisponible = (item: ItemCatalogo) => {
    if (item.tipo !== 'producto') return null;
    if (estaVencido(item.insumo.fechaVenc)) return 'Vencido';
    if (item.insumo.stock <= 0) return 'Sin stock';
    return null;
};

const noDisponible = (item: ItemCatalogo) => motivoNoDisponible(item) !== null;

interface BuscadorProductosProps {
    busqueda: string;
    setBusqueda: (valor: string) => void;
    productosFiltrados: Insumo[];
    serviciosFiltrados: Servicio[];
    cantidadEnCarrito: Record<string, number>;
    onAgregarProducto: (insumo: Insumo) => void;
    onAgregarServicio: (servicio: Servicio) => void;
}

export function BuscadorProductos({
    busqueda,
    setBusqueda,
    productosFiltrados,
    serviciosFiltrados,
    cantidadEnCarrito,
    onAgregarProducto,
    onAgregarServicio,
}: BuscadorProductosProps) {
    const [pestana, setPestana] = useState<Pestana>('todos');
    const [limite, setLimite] = useState(TAMANO_PAGINA);

    const hayBusqueda = busqueda.trim().length > 0;

    const items = useMemo<ItemCatalogo[]>(() => {
        const productos: ItemCatalogo[] = productosFiltrados.map((insumo) => ({
            tipo: 'producto',
            key: `insumo-${insumo.id}`,
            insumo,
        }));
        const servicios: ItemCatalogo[] = serviciosFiltrados.map(
            (servicio) => ({
                tipo: 'servicio',
                key: `servicio-${servicio.id}`,
                servicio,
            }),
        );
        if (pestana === 'productos') return productos;
        if (pestana === 'servicios') return servicios;
        // En "Todos" se mezclan por nombre y los agotados o vencidos quedan al final.
        return [...productos, ...servicios].sort(
            (a, b) =>
                Number(noDisponible(a)) - Number(noDisponible(b)) ||
                nombreDe(a).localeCompare(nombreDe(b), 'es'),
        );
    }, [productosFiltrados, serviciosFiltrados, pestana]);

    const visibles = hayBusqueda ? items : items.slice(0, limite);

    const cambiarPestana = (valor: Pestana) => {
        setPestana(valor);
        setLimite(TAMANO_PAGINA);
    };

    const cambiarBusqueda = (valor: string) => {
        setBusqueda(valor);
        setLimite(TAMANO_PAGINA);
    };

    const agregar = (item: ItemCatalogo) => {
        if (item.tipo === 'producto') onAgregarProducto(item.insumo);
        else onAgregarServicio(item.servicio);
    };

    const agregarPrimeraCoincidencia = (e: React.KeyboardEvent) => {
        if (e.key !== 'Enter' || !hayBusqueda) return;
        e.preventDefault();
        const primera = items.find((item) => !noDisponible(item));
        if (primera) agregar(primera);
    };

    return (
        <div className={styles.card}>
            <div className={styles.buscadorHeader}>
                <input
                    type="text"
                    placeholder="Buscar producto o servicio por nombre..."
                    value={busqueda}
                    onChange={(e) => cambiarBusqueda(e.target.value)}
                    onKeyDown={agregarPrimeraCoincidencia}
                    className={styles.buscadorInput}
                    autoFocus
                />
            </div>

            <div className={styles.pestanas} role="tablist">
                {PESTANAS.map((p) => (
                    <button
                        key={p.valor}
                        type="button"
                        role="tab"
                        aria-selected={pestana === p.valor}
                        className={`${styles.pestana} ${pestana === p.valor ? styles.pestanaActiva : ''}`}
                        onClick={() => cambiarPestana(p.valor)}
                    >
                        {p.label}
                    </button>
                ))}
            </div>

            {items.length === 0 && (
                <p className={styles.buscadorHint}>
                    {hayBusqueda
                        ? 'No se encontraron resultados'
                        : 'No hay elementos registrados en el catálogo.'}
                </p>
            )}

            {visibles.length > 0 && (
                <div
                    className={`${styles.catalogoGrid} ${hayBusqueda ? styles.catalogoScroll : ''}`}
                >
                    {visibles.map((item) => {
                        const nombre = nombreDe(item);
                        const motivo = motivoNoDisponible(item);
                        const enCarrito = cantidadEnCarrito[item.key];
                        const stockBajo =
                            item.tipo === 'producto' &&
                            !motivo &&
                            item.insumo.stock <= item.insumo.stockMinimo;
                        const precio =
                            item.tipo === 'producto'
                                ? item.insumo.precioUnit
                                : item.servicio.precio;
                        const imagenUrl =
                            item.tipo === 'producto'
                                ? item.insumo.imagenUrl
                                : null;

                        return (
                            <button
                                key={item.key}
                                type="button"
                                className={`${styles.catalogoCard} ${motivo ? styles.catalogoCardAgotada : ''}`}
                                disabled={motivo !== null}
                                onClick={() => agregar(item)}
                                title={nombre}
                            >
                                {enCarrito ? (
                                    <span
                                        className={styles.carritoBadge}
                                        aria-label={`${enCarrito} en el carrito`}
                                    >
                                        {enCarrito}
                                    </span>
                                ) : null}

                                {imagenUrl ? (
                                    <img
                                        src={imagenUrl}
                                        alt=""
                                        className={styles.catalogoFoto}
                                    />
                                ) : (
                                    <div
                                        className={`${styles.catalogoAvatar} ${item.tipo === 'servicio' ? styles.catalogoAvatarServicio : ''}`}
                                    >
                                        {nombre.charAt(0).toUpperCase()}
                                    </div>
                                )}

                                <span className={styles.catalogoNombre}>
                                    {nombre}
                                </span>
                                <span className={styles.catalogoPrecio}>
                                    ${precio.toFixed(2)}
                                </span>

                                {item.tipo === 'producto' ? (
                                    <span
                                        className={
                                            motivo
                                                ? styles.catalogoStockAgotado
                                                : stockBajo
                                                  ? styles.catalogoStockBajo
                                                  : styles.catalogoStock
                                        }
                                    >
                                        {motivo ??
                                            `Stock: ${item.insumo.stock}`}
                                    </span>
                                ) : (
                                    <span className={styles.catalogoStock}>
                                        Servicio
                                    </span>
                                )}

                                <span className={styles.addBtn}>+ Agregar</span>
                            </button>
                        );
                    })}
                </div>
            )}

            {!hayBusqueda && items.length > limite && (
                <button
                    type="button"
                    className={styles.verMasBtn}
                    onClick={() => setLimite((l) => l + TAMANO_PAGINA)}
                >
                    Ver más ({items.length - limite} restantes)
                </button>
            )}
        </div>
    );
}
