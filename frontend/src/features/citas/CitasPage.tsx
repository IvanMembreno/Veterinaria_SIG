import { Link } from 'react-router-dom';
import { HORAS_LABORALES, useCitas } from './hooks/useCitas';
import { useAuthStore } from '../auth/useAuthStore';
import { ConsultaForm } from '../consultas/ConsultaForm';
import { Modal } from '../../components/ui/Modal';
import { Autocomplete } from '../../components/ui/Autocomplete';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { FiltrosCitas } from './componentes/FiltrosCitas';
import { CalendarioCitas } from './componentes/CalendarioCitas';
import { ESTADO_LABEL, estadoBadgeClass } from './estado';
import { type Cita } from '../../api/citas.api';
import styles from './styles/citas.module.css';

export function CitasPage() {
    const {
        citas,
        totalCitas,
        mascotas,
        veterinarios,
        isLoading,
        puedeCrear,
        puedeAtender,
        isModalOpen,
        editingId,
        abrirNuevo,
        abrirEdicion,
        cerrarModal,
        form,
        setForm,
        fechaForm,
        horaForm,
        setFechaForm,
        setHoraForm,
        fechaMinima,
        horasDisponibles,
        errorHorario,
        advertenciaChoque,
        sinBloquesHoy,
        esHoraDeshabilitada,
        citaParaAtender,
        setCitaParaAtender,
        cancelarMutation,
        handleSubmit,
        isSaving,
        isError,
        error,
        filtros,
        setFiltros,
        limpiarFiltros,
        vista,
        setVista,
    } = useCitas();

    // El historial clínico (/mascotas/:id) solo está disponible para GERENTE y VETERINARIO.
    const usuario = useAuthStore((s) => s.usuario);
    const puedeVerHistorial = usuario
        ? ['GERENTE', 'VETERINARIO'].includes(usuario.rol)
        : false;

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
                        Total citas: <b>{totalCitas}</b>
                    </div>
                    <div className={styles.viewToggle}>
                        <button
                            type="button"
                            className={
                                vista === 'lista'
                                    ? styles.viewBtnActive
                                    : styles.viewBtn
                            }
                            onClick={() => setVista('lista')}
                        >
                            Lista
                        </button>
                        <button
                            type="button"
                            className={
                                vista === 'calendario'
                                    ? styles.viewBtnActive
                                    : styles.viewBtn
                            }
                            onClick={() => setVista('calendario')}
                        >
                            Calendario
                        </button>
                    </div>
                    {puedeCrear && (
                        <button
                            className={styles.newBtn}
                            onClick={abrirNuevo}
                        >
                            + Nueva Cita
                        </button>
                    )}
                </div>
            </header>

            <FiltrosCitas
                filtros={filtros}
                setFiltros={setFiltros}
                onLimpiar={limpiarFiltros}
            />

            {vista === 'lista' ? (
                <div className={styles.card}>
                    <table className={styles.citasTable}>
                        <thead>
                            <tr>
                                <th>Mascota</th>
                                <th>Veterinario</th>
                                <th>Fecha y Hora</th>
                                <th className={styles.textCenter}>Estado</th>
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
                                        <tr
                                            key={c.id}
                                            className={styles.tableRow}
                                        >
                                            <td className={styles.petCell}>
                                                {c.mascota?.nombre}
                                            </td>
                                            <td className={styles.vetCell}>
                                                {c.usuario?.nombre}
                                            </td>
                                            <td className={styles.dateCell}>
                                                {new Date(
                                                    c.fecha,
                                                ).toLocaleString()}
                                            </td>
                                            <td className={styles.textCenter}>
                                                <span
                                                    className={`${styles.statusBadge} ${styles[estadoBadgeClass(c.estado)]}`}
                                                >
                                                    {ESTADO_LABEL[c.estado]}
                                                </span>
                                            </td>
                                            <td className={styles.actionsCell}>
                                                {isScheduled || puedeVerHistorial ? (
                                                    <div className={styles.actionsGroup}>

                                                        {isScheduled && puedeAtender && (<button onClick={() => setCitaParaAtender(c.id) } className={styles.attendBtn}>
                                                            Atender
                                                        </button>)}

                                                        {isScheduled && puedeCrear && (<button
                                                            onClick={() =>
                                                                abrirEdicion(c)
                                                            }
                                                            className={
                                                                styles.editBtn
                                                            }
                                                        >
                                                            Editar/Reprogramar
                                                        </button>)}

                                                        {puedeVerHistorial && (
                                                            <Link
                                                                to={`/mascotas/${c.mascotaId}`}
                                                                className={
                                                                    styles.historialBtn
                                                                }
                                                            >
                                                                Ver historial
                                                            </Link>
                                                        )}

                                                        {isScheduled && puedeCrear && (<button
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
                                                        </button>)}
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
                                    <td
                                        colSpan={5}
                                        className={styles.emptyState}
                                    >
                                        No hay citas que coincidan con los
                                        filtros aplicados.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            ) : (
                <CalendarioCitas
                    citas={citas ?? []}
                    puedeAtender={puedeAtender}
                    puedeVerHistorial={puedeVerHistorial}
                    puedeGestionar={puedeCrear}
                    onAtender={setCitaParaAtender}
                    onEditar={abrirEdicion}
                    onCancelar={(id) => cancelarMutation.mutate(id)}
                />
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={cerrarModal}
                title={editingId ? 'Editar Cita' : 'Agendar Nueva Cita'}
            >
                <form onSubmit={handleSubmit} className={styles.formGrid}>
                    <div className={styles.formRow}>
                        <div className={styles.field}>
                            <label htmlFor="select-mascota">Mascota</label>
                            <Autocomplete
                                id="select-mascota"
                                placeholder="Escribe el nombre de la mascota"
                                options={(mascotas ?? []).map((m) => ({
                                    value: m.id,
                                    label: m.nombre,
                                    hint: m.cliente?.nombre,
                                }))}
                                value={form.mascotaId}
                                onChange={(mascotaId) =>
                                    setForm({ ...form, mascotaId })
                                }
                                required
                            />
                        </div>
                        <div className={styles.field}>
                            <label htmlFor="select-vet">Veterinario</label>
                            <Autocomplete
                                id="select-vet"
                                placeholder="Escribe el nombre del veterinario"
                                options={(veterinarios ?? []).map((v) => ({
                                    value: v.id,
                                    label: v.nombre,
                                }))}
                                value={form.usuarioId}
                                onChange={(usuarioId) =>
                                    setForm({ ...form, usuarioId })
                                }
                                required
                            />
                        </div>
                    </div>

                    <div className={styles.formRow}>
                        <div className={styles.field}>
                            <label htmlFor="input-fecha">Fecha</label>
                            <input
                                id="input-fecha"
                                type="date"
                                min={fechaMinima}
                                value={fechaForm}
                                onChange={(e) => setFechaForm(e.target.value)}
                                required
                            />
                        </div>
                        <div className={styles.field}>
                            <label htmlFor="select-hora">Hora</label>
                            <select
                                id="select-hora"
                                value={horaForm}
                                onChange={(e) => setHoraForm(e.target.value)}
                                required
                            >
                                {horasDisponibles.map((h) => (
                                    <option
                                        key={h}
                                        value={h}
                                        disabled={esHoraDeshabilitada(h)}
                                    >
                                        {HORAS_LABORALES.includes(h)
                                            ? h
                                            : `${h} (fuera de horario)`}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {sinBloquesHoy && (
                        <p className={styles.infoMsg}>
                            No hay horarios disponibles hoy; la primera fecha
                            disponible es mañana.
                        </p>
                    )}

                    {advertenciaChoque && (
                        <p className={styles.warningMsg}>{advertenciaChoque}</p>
                    )}

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

                    {errorHorario ? (
                        <p className={styles.errorMsg}>{errorHorario}</p>
                    ) : (
                        isError && (
                            <p className={styles.errorMsg}>
                                {getErrorMessage(
                                    error,
                                    'No se pudo guardar la cita.',
                                )}
                            </p>
                        )
                    )}

                    <button
                        type="submit"
                        className={styles.submitBtn}
                        disabled={isSaving}
                    >
                        {isSaving
                            ? 'Guardando...'
                            : editingId
                              ? 'Guardar Cambios'
                              : 'Agendar Cita'}
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
