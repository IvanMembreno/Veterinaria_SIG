import type { Cliente } from '../../../api/clientes.api';
import type { EstadoFactura, FacturasFiltros } from '../../../api/facturas.api';
import styles from '../styles/facturas.module.css';

interface FiltrosFacturasProps {
    filtros: FacturasFiltros;
    setFiltros: (filtros: FacturasFiltros) => void;
    clientes?: Cliente[];
    onLimpiar: () => void;
}

export function FiltrosFacturas({
    filtros,
    setFiltros,
    clientes,
    onLimpiar,
}: FiltrosFacturasProps) {
    return (
        <div className={styles.filtrosBar}>
            <div className={styles.filtroField}>
                <label htmlFor="filtro-desde">Desde</label>
                <input
                    id="filtro-desde"
                    type="date"
                    value={filtros.desde ?? ''}
                    onChange={(e) =>
                        setFiltros({ ...filtros, desde: e.target.value })
                    }
                />
            </div>

            <div className={styles.filtroField}>
                <label htmlFor="filtro-hasta">Hasta</label>
                <input
                    id="filtro-hasta"
                    type="date"
                    value={filtros.hasta ?? ''}
                    onChange={(e) =>
                        setFiltros({ ...filtros, hasta: e.target.value })
                    }
                />
            </div>

            <div className={styles.filtroField}>
                <label htmlFor="filtro-cliente">Cliente</label>
                <select
                    id="filtro-cliente"
                    value={filtros.clienteId ?? ''}
                    onChange={(e) =>
                        setFiltros({ ...filtros, clienteId: e.target.value })
                    }
                >
                    <option value="">Todos</option>
                    {clientes?.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.nombre}
                        </option>
                    ))}
                </select>
            </div>

            <div className={styles.filtroField}>
                <label htmlFor="filtro-estado">Estado</label>
                <select
                    id="filtro-estado"
                    value={filtros.estado ?? ''}
                    onChange={(e) =>
                        setFiltros({
                            ...filtros,
                            estado: (e.target.value || undefined) as
                                EstadoFactura | undefined,
                        })
                    }
                >
                    <option value="">Todos</option>
                    <option value="PENDIENTE">Pendiente</option>
                    <option value="PAGADA">Pagada</option>
                </select>
            </div>

            <button
                type="button"
                className={styles.clearBtn}
                onClick={onLimpiar}
            >
                Limpiar filtros
            </button>
        </div>
    );
}
