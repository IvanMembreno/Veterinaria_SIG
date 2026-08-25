import { useClientes } from './hooks/useClientes';
import { type Cliente } from '../../api/clientes.api';
import { Modal } from '../../components/ui/Modal';
import styles from './styles/clientes.module.css';
import basurero from '../../assets/actions/trash.svg';

export function ClientesPage() {
    const {
        clientes,
        isLoading,
        puedeCrear,
        isModalOpen,
        setIsModalOpen,
        form,
        setForm,
        deleteMutation,
        handleSubmit,
    } = useClientes();

    if (isLoading) {
        return (
            <div className={styles.loaderContainer}>
                <p>Abriendo el directorio de familias La Garrita Feliz...</p>
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
                    <h1 className={styles.mainTitle}>Directorio de Clientes</h1>
                    <p className={styles.subtitle}>
                        Gestiona los datos de contacto de los dueños de
                        mascotas.
                    </p>
                </div>
                <div className={styles.headerActions}>
                    <div className={styles.statsBadge}>
                        Total dueños: <b>{clientes?.length || 0}</b>
                    </div>
                    {puedeCrear && (
                        <button
                            className={styles.newBtn}
                            onClick={() => setIsModalOpen(true)}
                        >
                            + Nuevo Cliente
                        </button>
                    )}
                </div>
            </header>

            <div className={styles.card}>
                <table className={styles.clientesTable}>
                    <thead>
                        <tr>
                            <th>Propietario</th>
                            <th>Teléfono de Contacto</th>
                            <th>Email</th>
                            <th className={styles.textCenter}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {clientes && clientes.length > 0 ? (
                            clientes.map((c: Cliente) => (
                                <tr key={c.id} className={styles.tableRow}>
                                    <td className={styles.clientCell}>
                                        <div className={styles.avatar}>
                                            {c.nombre.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <span className={styles.clientName}>
                                                {c.nombre}
                                            </span>
                                            {c.direccion && (
                                                <small
                                                    className={
                                                        styles.clientDirection
                                                    }
                                                >
                                                    {c.direccion}
                                                </small>
                                            )}
                                        </div>
                                    </td>
                                    <td className={styles.phoneCell}>
                                        {c.telefono}
                                    </td>
                                    <td className={styles.emailCell}>
                                        {c.email ?? (
                                            <span className={styles.noData}>
                                                - No registrado -
                                            </span>
                                        )}
                                    </td>
                                    <td className={styles.actionsCell}>
                                        <button
                                            className={styles.btnDelete}
                                            onClick={() =>
                                                deleteMutation.mutate(c.id)
                                            }
                                            title="Eliminar cliente permanente"
                                        >
                                            <img
                                                src={basurero}
                                                alt=""
                                                className={styles.trash}
                                            />
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className={styles.emptyState}>
                                    No hay clientes registrados en el sistema.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Registrar Nuevo Cliente"
            >
                <form onSubmit={handleSubmit} className={styles.formGrid}>
                    <div className={styles.field}>
                        <label htmlFor="input-nombre">Nombre Completo</label>
                        <input
                            id="input-nombre"
                            placeholder="Ej: Carlos Mendoza"
                            value={form.nombre}
                            onChange={(e) =>
                                setForm({ ...form, nombre: e.target.value })
                            }
                            required
                        />
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="input-telefono">Teléfono</label>
                        <input
                            id="input-telefono"
                            placeholder="Ej: 555-0199"
                            value={form.telefono}
                            onChange={(e) =>
                                setForm({ ...form, telefono: e.target.value })
                            }
                            required
                        />
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="input-email">Correo Electrónico</label>
                        <input
                            id="input-email"
                            type="email"
                            placeholder="nombre@correo.com"
                            value={form.email}
                            onChange={(e) =>
                                setForm({ ...form, email: e.target.value })
                            }
                        />
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="input-direccion">
                            Dirección Residencial
                        </label>
                        <input
                            id="input-direccion"
                            placeholder="Ej: Av. Las Palmeras #123"
                            value={form.direccion}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    direccion: e.target.value,
                                })
                            }
                        />
                    </div>

                    <button type="submit" className={styles.submitBtn}>
                        Agregar Cliente
                    </button>
                </form>
            </Modal>
        </div>
    );
}
