import type { Mascota } from '../../../api/mascotas.api';
import type {
    EstadoRecordatorio,
    RecordatoriosFiltros,
} from '../../../api/recordatorios.api';
import styles from '../styles/recordatorios.module.css';

interface FiltrosRecordatoriosProps {
    filtros: RecordatoriosFiltros;
    setFiltros: (filtros: RecordatoriosFiltros) => void;
    mascotas?: Mascota[];
    onLimpiar: () => void;
}

export function FiltrosRecordatorios({
    filtros,
    setFiltros,
    mascotas,
    onLimpiar,
}: FiltrosRecordatoriosProps) {
    return (
        <div className={styles.filtrosBar}>
            <div className={styles.filtroField}>
                <label htmlFor="filtro-mascota">Mascota</label>
                <select
                    id="filtro-mascota"
                    value={filtros.mascotaId ?? ''}
                    onChange={(e) =>
                        setFiltros({ ...filtros, mascotaId: e.target.value })
                    }
                >
                    <option value="">Todas</option>
                    {mascotas?.map((m) => (
                        <option key={m.id} value={m.id}>
                            {m.nombre}
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
                                EstadoRecordatorio | undefined,
                        })
                    }
                >
                    <option value="">Todos</option>
                    <option value="PENDIENTE">Pendiente</option>
                    <option value="ENVIADO">Enviado</option>
                    <option value="COMPLETADO">Completado</option>
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
