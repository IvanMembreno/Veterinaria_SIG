import { useServicios } from './hooks/useServicios';
import { type Servicio } from '../../api/servicios.api';
import { Modal } from '../../components/ui/Modal';
import { getErrorMessage } from '../../utils/getErrorMessage';
import styles from './styles/servicios.module.css';
import lapiz from '../../assets/actions/pencil.svg';
import bloquear from '../../assets/actions/x.svg';

export function ServiciosPage() {
    const {
        servicios,
        isLoading,
        isModalOpen,
        editingId,
        form,
        setForm,
        abrirNuevo,
        abrirEdicion,
        cerrarModal,
        handleSubmit,
        desactivarMutation,
        isSaving,
        isError,
        error,
    } = useServicios();

    if (isLoading) {
        return (
            <div className={styles.loaderContainer}>
                <p>Cargando el catálogo de servicios de La Garrita Feliz...</p>
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
                    <h1 className={styles.mainTitle}>Catálogo de Servicios</h1>
                    <p className={styles.subtitle}>
                        Administra los servicios que se ofrecen y sus precios.
                    </p>
                </div>
                <div className={styles.headerActions}>
                    <div className={styles.statsBadge}>
                        Activos: <b>{servicios?.length || 0}</b>
                    </div>
                    <button className={styles.newBtn} onClick={abrirNuevo}>
                        + Nuevo Servicio
                    </button>
                </div>
            </header>

            <div className={styles.card}>
                <table className={styles.serviciosTable}>
                    <thead>
                        <tr>
                            <th>Servicio</th>
                            <th>Precio</th>
                            <th>Estado</th>
                            <th className={styles.textCenter}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {servicios && servicios.length > 0 ? (
                            servicios.map((s: Servicio) => (
                                <tr key={s.id} className={styles.tableRow}>
                                    <td className={styles.nameCell}>
                                        {s.nombre}
                                    </td>
                                    <td className={styles.priceCell}>
                                        ${s.precio.toFixed(2)}
                                    </td>
                                    <td>
                                        <span className={styles.estadoActivo}>
                                            Activo
                                        </span>
                                    </td>
                                    <td className={styles.actionsCell}>
                                        <button
                                            className={styles.btnEdit}
                                            onClick={() => abrirEdicion(s)}
                                            title="Editar servicio"
                                        >
                                            <img
                                                src={lapiz}
                                                alt=""
                                                className={styles.actionIcon}
                                            />
                                            Editar
                                        </button>
                                        <button
                                            className={styles.btnDeactivate}
                                            onClick={() =>
                                                desactivarMutation.mutate(s.id)
                                            }
                                            title="Desactivar servicio"
                                        >
                                            <img
                                                src={bloquear}
                                                alt=""
                                                className={styles.actionIcon}
                                            />
                                            Desactivar
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className={styles.emptyState}>
                                    No hay servicios activos en el sistema.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={cerrarModal}
                title={
                    editingId ? 'Editar Servicio' : 'Registrar Nuevo Servicio'
                }
            >
                <form onSubmit={handleSubmit} className={styles.formGrid}>
                    <div className={styles.field}>
                        <label htmlFor="input-nombre">Nombre</label>
                        <input
                            id="input-nombre"
                            placeholder="Ej: Consulta general"
                            value={form.nombre}
                            onChange={(e) =>
                                setForm({ ...form, nombre: e.target.value })
                            }
                            required
                        />
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="input-precio">Precio</label>
                        <input
                            id="input-precio"
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            value={form.precio}
                            onChange={(e) =>
                                setForm({ ...form, precio: e.target.value })
                            }
                            required
                        />
                    </div>

                    {isError && (
                        <p className={styles.errorMsg}>
                            {getErrorMessage(
                                error,
                                'No se pudo guardar el servicio.',
                            )}
                        </p>
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
                              : 'Crear Servicio'}
                    </button>
                </form>
            </Modal>
        </div>
    );
}
