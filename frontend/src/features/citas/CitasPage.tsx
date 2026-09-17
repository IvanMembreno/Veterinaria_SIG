import { useCitas } from './hooks/useCitas';
import { ConsultaForm } from '../consultas/ConsultaForm';
import { Modal } from '../../components/ui/Modal';
import { type Cita } from '../../api/citas.api';
import styles from './styles/citas.module.css';

function estadoClase(estado: string) {
    if (estado === 'PROGRAMADA' || estado === 'CONFIRMADA')
        return 'statusActive';
    if (estado === 'CANCELADA' || estado === 'NO_ASISTIO')
        return 'statusCancelled';
    return 'statusDone';
}

export function CitasPage() {
    const {
        citas,
        mascotas,
        veterinarios,
        isLoading,
        puedeCrear,
        isModalOpen,
        setIsModalOpen,
        form,
        setForm,
        citaParaAtender,
        setCitaParaAtender,
        cancelarMutation,
        handleSubmit,
    } = useCitas();

    if (isLoading) {
        return (
            <div className={styles.loaderContainer}>
                <p>Consultando la agenda de La Garrita Feliz...</p>
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
                    <h1 className={styles.mainTitle}>Gestión de Citas</h1>
                    <p className={styles.subtitle}>
                        Agenda, atiende y da seguimiento a las visitas
                        programadas.
                    </p>
                </div>
                <div className={styles.headerActions}>
                    <div className={styles.statsBadge}>
                        Total citas: <b>{citas?.length || 0}</b>
                    </div>
                    {puedeCrear && (
                        <button
                            className={styles.newBtn}
                            onClick={() => setIsModalOpen(true)}
                        >
                            + Nueva Cita
                        </button>
                    )}
                </div>
            </header>

            <div className={styles.card}>
                <table className={styles.citasTable}>
                    <thead>
                        <tr>
                            <th>Mascota</th>
                            <th>Veterinario</th>
                            <th>Fecha y Hora</th>
                            <th>Estado</th>
                            <th className={styles.textCenter}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {citas && citas.length > 0 ? (
                            citas.map((c: Cita) => {
                                const isScheduled =
                                    c.estado === 'PROGRAMADA' ||
                                    c.estado === 'CONFIRMADA';
                                return (
                                    <tr key={c.id} className={styles.tableRow}>
                                        <td className={styles.petCell}>
                                            {c.mascota?.nombre}
                                        </td>
                                        <td className={styles.vetCell}>
                                            {c.usuario?.nombre}
                                        </td>
                                        <td className={styles.dateCell}>
                                            {new Date(c.fecha).toLocaleString()}
                                        </td>
                                        <td>
                                            <span
                                                className={`${styles.statusBadge} ${styles[estadoClase(c.estado)]}`}
                                            >
                                                {c.estado}
                                            </span>
                                        </td>
                                        <td className={styles.actionsCell}>
                                            {isScheduled ? (
                                                <div
                                                    className={
                                                        styles.actionGroup
                                                    }
                                                >
                                                    <button
                                                        onClick={() =>
                                                            setCitaParaAtender(
                                                                c.id,
                                                            )
                                                        }
                                                        className={
                                                            styles.attendBtn
                                                        }
                                                    >
                                                        Atender
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            cancelarMutation.mutate(
                                                                c.id,
                                                            )
                                                        }
                                                        className={
                                                            styles.cancelBtn
                                                        }
                                                    >
                                                        Cancelar
                                                    </button>
                                                </div>
                                            ) : (
                                                <span
                                                    className={
                                                        styles.emptyActions
                                                    }
                                                >
                                                    -
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={5} className={styles.emptyState}>
                                    No hay citas registradas en el sistema.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Agendar Nueva Cita"
            >
                <form onSubmit={handleSubmit} className={styles.formGrid}>
                    <div className={styles.formRow}>
                        <div className={styles.field}>
                            <label htmlFor="select-mascota">Mascota</label>
                            <select
                                id="select-mascota"
                                value={form.mascotaId}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        mascotaId: e.target.value,
                                    })
                                }
                                required
                            >
                                <option value="">-- Mascota --</option>
                                {mascotas?.map((m) => (
                                    <option key={m.id} value={m.id}>
                                        {m.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className={styles.field}>
                            <label htmlFor="select-vet">Veterinario</label>
                            <select
                                id="select-vet"
                                value={form.usuarioId}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        usuarioId: e.target.value,
                                    })
                                }
                                required
                            >
                                <option value="">-- Veterinario --</option>
                                {veterinarios?.map((v) => (
                                    <option key={v.id} value={v.id}>
                                        {v.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="input-fecha">Fecha y Hora</label>
                        <input
                            id="input-fecha"
                            type="datetime-local"
                            value={form.fecha}
                            onChange={(e) =>
                                setForm({ ...form, fecha: e.target.value })
                            }
                            required
                        />
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="input-motivo">Motivo</label>
                        <input
                            id="input-motivo"
                            placeholder="Ej: Control de vacunación"
                            value={form.motivo}
                            onChange={(e) =>
                                setForm({ ...form, motivo: e.target.value })
                            }
                            required
                        />
                    </div>

                    <button type="submit" className={styles.submitBtn}>
                        Agendar Cita
                    </button>
                </form>
            </Modal>

            {citaParaAtender && (
                <ConsultaForm
                    citaId={citaParaAtender}
                    onClose={() => setCitaParaAtender(null)}
                />
            )}
        </div>
    );
}
