import { useRecordatorios } from './hooks/useRecordatorios';
import { FiltrosRecordatorios } from './componentes/FiltrosRecordatorios';
import { ModalNuevoRecordatorio } from './componentes/ModalNuevoRecordatorio';
import { type Recordatorio } from '../../api/recordatorios.api';
import styles from './styles/recordatorios.module.css';

const TIPO_LABEL: Record<Recordatorio['tipo'], string> = {
    VACUNA: 'Vacuna',
    CONTROL: 'Control',
};

function estadoClase(estado: Recordatorio['estado']) {
    if (estado === 'PENDIENTE') return 'estadoPendiente';
    if (estado === 'ENVIADO') return 'estadoEnviado';
    return 'estadoCompletado';
}

export function RecordatoriosPage() {
    const {
        recordatorios,
        isLoading,
        mascotas,
        filtros,
        setFiltros,
        limpiarFiltros,
        isModalOpen,
        abrirNuevo,
        cerrarModal,
        form,
        setForm,
        handleSubmit,
        createMutation,
        enviarRecordatorio,
        enviarMutation,
    } = useRecordatorios();

    if (isLoading) {
        return (
            <div className={styles.loaderContainer}>
                <p>Consultando los recordatorios de La Garrita Feliz...</p>
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
                    <h1 className={styles.mainTitle}>Recordatorios</h1>
                    <p className={styles.subtitle}>
                        Programa y da seguimiento a vacunas y controles de cada
                        paciente.
                    </p>
                </div>
                <div className={styles.headerActions}>
                    <div className={styles.statsBadge}>
                        Recordatorios: <b>{recordatorios?.length || 0}</b>
                    </div>
                    <button className={styles.newBtn} onClick={abrirNuevo}>
                        + Nuevo Recordatorio
                    </button>
                </div>
            </header>

            <FiltrosRecordatorios
                filtros={filtros}
                setFiltros={setFiltros}
                mascotas={mascotas}
                onLimpiar={limpiarFiltros}
            />

            <div className={styles.card}>
                <table className={styles.recordatoriosTable}>
                    <thead>
                        <tr>
                            <th>Mascota</th>
                            <th>Cliente</th>
                            <th>Tipo</th>
                            <th>Fecha Programada</th>
                            <th>Estado</th>
                            <th className={styles.textCenter}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recordatorios && recordatorios.length > 0 ? (
                            recordatorios.map((r: Recordatorio) => (
                                <tr key={r.id} className={styles.tableRow}>
                                    <td className={styles.mascotaCell}>
                                        {r.mascota?.nombre ?? '-'}
                                    </td>
                                    <td className={styles.clientCell}>
                                        {r.mascota?.cliente?.nombre ?? (
                                            <span className={styles.noData}>
                                                Sin asignar
                                            </span>
                                        )}
                                    </td>
                                    <td>
                                        <span className={styles.tipoBadge}>
                                            {TIPO_LABEL[r.tipo]}
                                        </span>
                                    </td>
                                    <td className={styles.dateCell}>
                                        {new Date(
                                            r.fechaProgramada,
                                        ).toLocaleDateString()}
                                    </td>
                                    <td>
                                        <span
                                            className={
                                                styles[estadoClase(r.estado)]
                                            }
                                        >
                                            {r.estado}
                                        </span>
                                    </td>
                                    <td className={styles.actionsCell}>
                                        {r.estado === 'PENDIENTE' ? (
                                            <button
                                                className={styles.sendBtn}
                                                disabled={
                                                    !r.mascota?.cliente
                                                        ?.telefono
                                                }
                                                title={
                                                    r.mascota?.cliente?.telefono
                                                        ? 'Enviar recordatorio por WhatsApp'
                                                        : 'El cliente no tiene teléfono registrado'
                                                }
                                                onClick={() =>
                                                    enviarRecordatorio(r)
                                                }
                                            >
                                                Enviar recordatorio
                                            </button>
                                        ) : (
                                            <span
                                                className={styles.emptyActions}
                                            >
                                                -
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className={styles.emptyState}>
                                    No hay recordatorios que coincidan con los
                                    filtros aplicados.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <ModalNuevoRecordatorio
                isOpen={isModalOpen}
                onClose={cerrarModal}
                mascotas={mascotas}
                form={form}
                setForm={setForm}
                onSubmit={handleSubmit}
                isSaving={createMutation.isPending}
                isError={createMutation.isError}
                error={createMutation.error}
            />

            {enviarMutation.isError && (
                <p className={styles.toastError}>
                    No se pudo actualizar el estado del recordatorio tras abrir
                    WhatsApp. Intenta de nuevo.
                </p>
            )}
        </div>
    );
}
