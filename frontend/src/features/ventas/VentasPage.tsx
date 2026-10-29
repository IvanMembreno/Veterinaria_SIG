import { useVentas } from './hooks/useVentas';
import { BuscadorProductos } from './componentes/BuscadorProductos';
import { Carrito } from './componentes/Carrito';
import { ModalCobro } from './componentes/ModalCobro';
import styles from './styles/ventas.module.css';

export function VentasPage() {
    const {
        isLoading,
        busqueda,
        setBusqueda,
        productosFiltrados,
        serviciosFiltrados,
        carrito,
        agregarProducto,
        agregarServicio,
        actualizarCantidad,
        quitarDelCarrito,
        total,
        metodoPago,
        setMetodoPago,
        isCobroModalOpen,
        abrirCobro,
        ventaMutation,
        facturaGenerada,
        confirmarCobro,
        cerrarCobro,
    } = useVentas();

    if (isLoading) {
        return (
            <div className={styles.loaderContainer}>
                <p>Preparando el punto de venta de La Garrita Feliz...</p>
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
                    <h1 className={styles.mainTitle}>Punto de Venta</h1>
                    <p className={styles.subtitle}>
                        Vende productos de inventario y servicios sin necesidad
                        de una consulta asociada.
                    </p>
                </div>
            </header>

            <div className={styles.posGrid}>
                <BuscadorProductos
                    busqueda={busqueda}
                    setBusqueda={setBusqueda}
                    productosFiltrados={productosFiltrados}
                    serviciosFiltrados={serviciosFiltrados}
                    onAgregarProducto={agregarProducto}
                    onAgregarServicio={agregarServicio}
                />

                <Carrito
                    carrito={carrito}
                    total={total}
                    onActualizarCantidad={actualizarCantidad}
                    onQuitar={quitarDelCarrito}
                    onCobrar={abrirCobro}
                />
            </div>

            <ModalCobro
                isOpen={isCobroModalOpen}
                onClose={cerrarCobro}
                total={total}
                metodoPago={metodoPago}
                setMetodoPago={setMetodoPago}
                onConfirmar={confirmarCobro}
                isPending={ventaMutation.isPending}
                isError={ventaMutation.isError}
                error={ventaMutation.error}
                factura={facturaGenerada}
            />
        </div>
    );
}
