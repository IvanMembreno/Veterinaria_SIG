import { useRecordatorios } from './hooks/useRecordatorios';
import { FiltrosRecordatorios } from './componentes/FiltrosRecordatorios';
import { ModalNuevoRecordatorio } from './componentes/ModalNuevoRecordatorio';
import { type Recordatorio } from '../../api/recordatorios.api';
import { formatearTelefono } from '../../utils/telefono';
import { telefonoWhatsapp } from './whatsapp';
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

// Motivo por el que el backend rechazaría el envío por API, o null si se puede enviar.
function bloqueoApi(recordatorio: Recordatorio) {
    if (!telefonoWhatsapp(recordatorio)) {
        return 'El cliente no tiene un teléfono válido';
    }
    if (!recordatorio.mascota?.cliente?.aceptaRecordatorios) {
        return 'El cliente no autoriza recordatorios por WhatsApp';
    }
    return null;
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
        editingId,
        abrirNuevo,
        abrirEdicion,
        cerrarModal,
        form,
        setForm,
        handleSubmit,
        isSaving,
        isError,
        error,
        enviarRecordatorio,
        apiWhatsappHabilitada,
        enviarApiMutation,
        aviso,
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
                            <th className={styles.textCenter}>Tipo</th>
                            <th>Fecha Programada</th>
                            <th className={styles.textCenter}>Estado</th>
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
                                        {r.mascota?.cliente ? (
                                            <>
                                                {r.mascota.cliente.nombre}
                                                {r.mascota.cliente.telefono && (
                                                    <small
                                                        className={
                                                            styles.clientPhone
                                                        }
                                                    >
                                                        {formatearTelefono(
                                                            r.mascota.cliente
                                                                .telefono,
                                                        )}
                                                    </small>
                                                )}
                                                {!r.mascota.cliente
                                                    .aceptaRecordatorios && (
                                                    <small
                                                        className={
                                                            styles.avisoConsentimiento
                                                        }
                                                        title="El envío manual sigue disponible; confirma con el cliente antes de escribirle."
                                                    >
                                                        ⚠ El cliente no autoriza
                                                        recordatorios por
                                                        WhatsApp
                                                    </small>
                                                )}
                                            </>
                                        ) : (
                                            <span className={styles.noData}>
                                                Sin asignar
                                            </span>
                                        )}
                                    </td>
                                    <td className={styles.textCenter}>
                                        <span className={styles.tipoBadge}>
                                            {TIPO_LABEL[r.tipo]}
                                        </span>
                                    </td>
                                    <td className={styles.dateCell}>
                                        {new Date(
                                            r.fechaProgramada,
                                        ).toLocaleDateString()}
                                    </td>
                                    <td className={styles.textCenter}>
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
                                            <div
                                                className={styles.actionsGroup}
                                            >
                                                <button
                                                    className={styles.editBtn}
                                                    onClick={() =>
                                                        abrirEdicion(r)
                                                    }
                                                >
                                                    Editar
                                                </button>
                                                {apiWhatsappHabilitada && (
                                                    <button
                                                        className={
                                                            styles.sendBtn
                                                        }
                                                        disabled={
                                                            enviarApiMutation.isPending ||
                                                            bloqueoApi(r) !==
                                                                null
                                                        }
                                                        title={
                                                            bloqueoApi(r) ??
                                                            'Enviar la plantilla por la API de WhatsApp'
                                                        }
                                                        onClick={() =>
                                                            enviarApiMutation.mutate(
                                                                r.id,
                                                            )
                                                        }
                                                    >
                                                        {enviarApiMutation.isPending &&
                                                        enviarApiMutation.variables ===
                                                            r.id
                                                            ? 'Enviando...'
                                                            : 'Enviar por WhatsApp'}
                                                    </button>
                                                )}
                                                <button
                                                    className={styles.manualBtn}
                                                    disabled={
                                                        !telefonoWhatsapp(r)
                                                    }
                                                    title={
                                                        telefonoWhatsapp(r)
                                                            ? 'Abrir el chat en WhatsApp con el mensaje listo'
                                                            : 'El cliente no tiene un teléfono válido'
                                                    }
                                                    onClick={() =>
                                                        enviarRecordatorio(r)
                                                    }
                                                >
                                                    Abrir WhatsApp
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
                isEditing={editingId !== null}
                onClose={cerrarModal}
                mascotas={mascotas}
                form={form}
                setForm={setForm}
                onSubmit={handleSubmit}
                isSaving={isSaving}
                isError={isError}
                error={error}
            />

            {aviso && (
                <p
                    role="status"
                    className={
                        aviso.tipo === 'exito'
                            ? styles.toastExito
                            : styles.toastError
                    }
                >
                    {aviso.texto}
                </p>
            )}
        </div>
    );
}
