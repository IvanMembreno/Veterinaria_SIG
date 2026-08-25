import { useInventario } from './hooks/useInventario';
import { type Insumo } from '../../api/inventario.api';
import styles from './styles/inventario.module.css';

function estadoVencimiento(fechaVenc?: string) {
    if (!fechaVenc) return null;

    const hoy = new Date();
    const vence = new Date(fechaVenc);
    const dias = Math.ceil(
        (vence.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (dias < 0) {
        return { label: 'Vencido', className: styles.vencVencido };
    }
    if (dias <= 30) {
        return {
            label: `Vence en ${dias}d`,
            className: styles.vencProximo,
        };
    }
    return {
        label: vence.toLocaleDateString(),
        className: styles.vencLejano,
    };
}

function nivelStock(stock: number, stockMinimo: number) {
    if (stock <= stockMinimo) return 'critico';
    if (stock <= stockMinimo * 1.5) return 'bajo';
    return 'saludable';
}

export function InventarioPage() {
    const {
        insumos,
        isLoading,
        puedeCrear,
        form,
        setForm,
        entradas,
        setEntradas,
        entradaMutation,
        handleSubmit,
    } = useInventario();

    if (isLoading) {
        return (
            <div className={styles.loaderContainer}>
                <p>Cargando el almacén de La Garrita Feliz...</p>
            </div>
        );
    }

    const bajoMinimo = insumos?.filter((i) => i.stock <= i.stockMinimo) ?? [];

    return (
        <div className={styles.pageWrapper}>
            <header className={styles.pageHeader}>
                <div>
                    <span className={styles.subBrand}>
                        VETERINARIA LA GARRITA FELIZ
                    </span>
                    <h1 className={styles.mainTitle}>Inventario de Insumos</h1>
                    <p className={styles.subtitle}>
                        Controla existencias, vencimientos y reabastecimiento.
                    </p>
                </div>
                <div
                    className={`${styles.statsBadge} ${bajoMinimo.length > 0 ? styles.statsBadgeAlert : ''}`}
                >
                    <span>
                        Bajo mínimo: <b>{bajoMinimo.length}</b>
                    </span>
                </div>
            </header>

            {puedeCrear && (
                <section className={styles.bookingBanner}>
                    <h3 className={styles.bannerTitle}>
                        Registrar Nuevo Insumo
                    </h3>
                    <form onSubmit={handleSubmit} className={styles.formGrid}>
                        <div className={styles.field}>
                            <label htmlFor="input-nombre">Nombre</label>
                            <input
                                id="input-nombre"
                                placeholder="Ej: Vacuna triple felina"
                                value={form.nombre}
                                onChange={(e) =>
                                    setForm({ ...form, nombre: e.target.value })
                                }
                                required
                            />
                        </div>

                        <div className={styles.field}>
                            <label htmlFor="input-lote">Lote</label>
                            <input
                                id="input-lote"
                                placeholder="Ej: L-2026-04"
                                value={form.lote}
                                onChange={(e) =>
                                    setForm({ ...form, lote: e.target.value })
                                }
                            />
                        </div>

                        <div className={styles.field}>
                            <label htmlFor="input-vence">Vence</label>
                            <input
                                id="input-vence"
                                type="date"
                                value={form.fechaVenc}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        fechaVenc: e.target.value,
                                    })
                                }
                            />
                        </div>

                        <div className={styles.field}>
                            <label htmlFor="input-stock">Stock inicial</label>
                            <input
                                id="input-stock"
                                type="number"
                                placeholder="0"
                                value={form.stock}
                                onChange={(e) =>
                                    setForm({ ...form, stock: e.target.value })
                                }
                                required
                            />
                        </div>

                        <div className={styles.field}>
                            <label htmlFor="input-minimo">Stock mínimo</label>
                            <input
                                id="input-minimo"
                                type="number"
                                placeholder="5"
                                value={form.stockMinimo}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        stockMinimo: e.target.value,
                                    })
                                }
                            />
                        </div>

                        <div className={styles.field}>
                            <label htmlFor="input-precio">
                                Precio unitario
                            </label>
                            <input
                                id="input-precio"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={form.precioUnit}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        precioUnit: e.target.value,
                                    })
                                }
                                required
                            />
                        </div>

                        <button type="submit" className={styles.submitBtn}>
                            Agregar Insumo
                        </button>
                    </form>
                </section>
            )}

            <div className={styles.tableResponsive}>
                <table className={styles.inventarioTable}>
                    <thead>
                        <tr>
                            <th>Insumo</th>
                            <th>Lote</th>
                            <th>Vencimiento</th>
                            <th>Existencias</th>
                            <th>Precio</th>
                            <th className={styles.textCenter}>
                                Registrar entrada
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {insumos && insumos.length > 0 ? (
                            insumos.map((i: Insumo) => {
                                const venc = estadoVencimiento(i.fechaVenc);
                                const nivel = nivelStock(
                                    i.stock,
                                    i.stockMinimo,
                                );
                                const porcentaje = Math.min(
                                    (i.stock / (i.stockMinimo * 2 || 1)) * 100,
                                    100,
                                );

                                return (
                                    <tr key={i.id} className={styles.tableRow}>
                                        <td className={styles.nameCell}>
                                            {i.nombre}
                                        </td>
                                        <td className={styles.loteCell}>
                                            {i.lote ?? (
                                                <span className={styles.noData}>
                                                    - Sin lote -
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            {venc ? (
                                                <span
                                                    className={`${styles.vencBadge} ${venc.className}`}
                                                >
                                                    {venc.label}
                                                </span>
                                            ) : (
                                                <span className={styles.noData}>
                                                    -
                                                </span>
                                            )}
                                        </td>
                                        <td className={styles.stockCell}>
                                            <div
                                                className={styles.stockNumbers}
                                            >
                                                <span
                                                    className={
                                                        styles.stockValue
                                                    }
                                                >
                                                    {i.stock}
                                                </span>
                                                <span
                                                    className={styles.stockMin}
                                                >
                                                    mín. {i.stockMinimo}
                                                </span>
                                            </div>
                                            <div
                                                className={styles.stockBarTrack}
                                            >
                                                <div
                                                    className={`${styles.stockBarFill} ${styles[`nivel-${nivel}`]}`}
                                                    style={{
                                                        width: `${porcentaje}%`,
                                                    }}
                                                />
                                            </div>
                                        </td>
                                        <td className={styles.priceCell}>
                                            ${i.precioUnit}
                                        </td>
                                        <td className={styles.entradaCell}>
                                            <div
                                                className={styles.entradaGroup}
                                            >
                                                <input
                                                    type="number"
                                                    min="1"
                                                    placeholder="Cant."
                                                    className={
                                                        styles.entradaInput
                                                    }
                                                    value={entradas[i.id] ?? ''}
                                                    onChange={(e) =>
                                                        setEntradas({
                                                            ...entradas,
                                                            [i.id]: e.target
                                                                .value,
                                                        })
                                                    }
                                                />
                                                <button
                                                    className={
                                                        styles.entradaBtn
                                                    }
                                                    disabled={!entradas[i.id]}
                                                    onClick={() =>
                                                        entradaMutation.mutate({
                                                            id: i.id,
                                                            cantidad: Number(
                                                                entradas[i.id],
                                                            ),
                                                        })
                                                    }
                                                >
                                                    + Agregar
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={6} className={styles.emptyState}>
                                    No hay insumos registrados en el sistema.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
