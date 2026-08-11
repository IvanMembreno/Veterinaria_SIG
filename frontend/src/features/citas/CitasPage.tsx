import { useCitas } from './hooks/useCitas';
import { ConsultaForm } from '../consultas/ConsultaForm';
import { type Cita } from '../../api/citas.api';
import styles from './styles/citas.module.css';

export function CitasPage() {
    const {
        citas,
        mascotas,
        veterinarios,
        isLoading,
        puedeCrear,
        form,
        setForm,
        citaParaAtender,
        setCitaParaAtender,
        cancelarMutation,
        handleSubmit,
    } = useCitas();

    if (isLoading) return <p className={styles.loadingText}>Cargando...</p>;

    return (
        <div className={styles.pageContainer}>
            <h2 className={styles.pageTitle}>Gestión de Citas</h2>

            {puedeCrear && (
                <div className={styles.formCard}>
                    <form onSubmit={handleSubmit} className={styles.formInline}>
                        <div className={styles.selectWrapper}>
                            <select
                                value={form.mascotaId}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        mascotaId: e.target.value,
                                    })
                                }
                                required
                            >
                                <option value="">--Mascota--</option>
                                {mascotas?.map((m) => (
                                    <option key={m.id} value={m.id}>
                                        {m.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.selectWrapper}>
                            <select
                                value={form.usuarioId}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        usuarioId: e.target.value,
                                    })
                                }
                                required
                            >
                                <option value="">--Veterinario--</option>
                                {veterinarios?.map((v) => (
                                    <option key={v.id} value={v.id}>
                                        {v.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <input
                            type="datetime-local"
                            value={form.fecha}
                            onChange={(e) =>
                                setForm({ ...form, fecha: e.target.value })
                            }
                            className={styles.dateTimeInput}
                            required
                        />

                        <input
                            placeholder="Motivo de la consulta"
                            value={form.motivo}
                            onChange={(e) =>
                                setForm({ ...form, motivo: e.target.value })
                            }
                            className={styles.textInput}
                            required
                        />

                        <button type="submit" className={styles.scheduleBtn}>
                            Agendar Cita
                        </button>
                    </form>
                </div>
            )}

            <div className={styles.tableWrapper}>
                <table className={styles.citasTable}>
                    <thead>
                        <tr>
                            <th>Mascota</th>
                            <th>Veterinario</th>
                            <th>Fecha & Hora</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {citas?.map((c: Cita) => {
                            const isScheduled =
                                c.estado === 'PROGRAMADA' ||
                                c.estado === 'CONFIRMADA';
                            return (
                                <tr key={c.id}>
                                    <td className={styles.petCell}>
                                        {c.mascota?.nombre}
                                    </td>
                                    <td className={styles.darkTextCell}>
                                        {c.usuario?.nombre}
                                    </td>
                                    <td className={styles.dateCell}>
                                        {new Date(c.fecha).toLocaleString()}
                                    </td>
                                    <td>
                                        <span
                                            className={`${styles.statusBadge} ${isScheduled ? styles.statusActive : styles.statusInactive}`}
                                        >
                                            {c.estado}
                                        </span>
                                    </td>
                                    <td>
                                        {isScheduled ? (
                                            <div className={styles.actionGroup}>
                                                <button
                                                    onClick={() =>
                                                        setCitaParaAtender(c.id)
                                                    }
                                                    className={styles.attendBtn}
                                                >
                                                    Atender
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        cancelarMutation.mutate(
                                                            c.id,
                                                        )
                                                    }
                                                    className={styles.cancelBtn}
                                                >
                                                    Cancelar
                                                </button>
                                            </div>
                                        ) : (
                                            <span
                                                className={styles.emptyActions}
                                            >
                                                -
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {citaParaAtender && (
                <ConsultaForm
                    citaId={citaParaAtender}
                    onClose={() => setCitaParaAtender(null)}
                />
            )}
        </div>
    );
}
