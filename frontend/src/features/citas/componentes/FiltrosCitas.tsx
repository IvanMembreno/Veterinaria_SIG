import type { Cita } from '../../../api/citas.api';
import type { CitasFiltros } from '../hooks/useCitas';
import { ESTADO_LABEL } from '../estado';
import styles from '../styles/citas.module.css';

const ESTADOS: Cita['estado'][] = [
    'PROGRAMADA',
    'CONFIRMADA',
    'ATENDIDA',
    'CANCELADA',
    'NO_ASISTIO',
];

interface FiltrosCitasProps {
    filtros: CitasFiltros;
    setFiltros: (filtros: CitasFiltros) => void;
    onLimpiar: () => void;
}

export function FiltrosCitas({
    filtros,
    setFiltros,
    onLimpiar,
}: FiltrosCitasProps) {
    return (
        <div className={styles.filtrosBar}>
            <div className={styles.filtroField}>
                <label htmlFor="filtro-estado">Estado</label>
                <select
                    id="filtro-estado"
                    value={filtros.estado}
                    onChange={(e) =>
                        setFiltros({
                            ...filtros,
                            estado: e.target.value as CitasFiltros['estado'],
                        })
                    }
                >
                    <option value="">Todos</option>
                    {ESTADOS.map((estado) => (
                        <option key={estado} value={estado}>
                            {ESTADO_LABEL[estado]}
                        </option>
                    ))}
                </select>
            </div>

            <div className={styles.filtroField}>
                <label htmlFor="filtro-desde">Desde</label>
                <input
                    id="filtro-desde"
                    type="date"
                    value={filtros.desde}
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
                    value={filtros.hasta}
                    onChange={(e) =>
                        setFiltros({ ...filtros, hasta: e.target.value })
                    }
                />
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
