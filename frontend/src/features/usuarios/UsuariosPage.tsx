import { useUsuarios } from './hooks/useUsuarios';
import { type Usuario } from '../../api/usuarios.api';
import { Modal } from '../../components/ui/Modal';
import { getErrorMessage } from '../../utils/getErrorMessage';
import styles from './styles/usuarios.module.css';
import lapiz from '../../assets/actions/pencil.svg';
import bloquear from '../../assets/actions/x.svg';

const ROLES: Usuario['rol'][] = [
    'GERENTE',
    'VETERINARIO',
    'RECEPCION',
    'INVENTARIO',
];

function rolBadgeClass(rol: string) {
    switch (rol) {
        case 'GERENTE':
            return styles.rolGerente;
        case 'VETERINARIO':
            return styles.rolVeterinario;
        case 'RECEPCION':
            return styles.rolRecepcion;
        default:
            return styles.rolInventario;
    }
}

export function UsuariosPage() {
    const {
        usuarios,
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
    } = useUsuarios();

    if (isLoading) {
        return (
            <div className={styles.loaderContainer}>
                <p>Cargando el equipo de La Garrita Feliz...</p>
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
                    <h1 className={styles.mainTitle}>Usuarios del Sistema</h1>
                    <p className={styles.subtitle}>
                        Administra las cuentas y roles del personal.
                    </p>
                </div>
                <div className={styles.headerActions}>
                    <div className={styles.statsBadge}>
                        Activos: <b>{usuarios?.length || 0}</b>
                    </div>
                    <button className={styles.newBtn} onClick={abrirNuevo}>
                        + Nuevo Usuario
                    </button>
                </div>
            </header>

            <div className={styles.card}>
                <table className={styles.usuariosTable}>
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Email</th>
                            <th>Rol</th>
                            <th>Estado</th>
                            <th className={styles.textCenter}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usuarios && usuarios.length > 0 ? (
                            usuarios.map((u: Usuario) => (
                                <tr key={u.id} className={styles.tableRow}>
                                    <td className={styles.userCell}>
                                        <div className={styles.avatar}>
                                            {u.nombre.charAt(0).toUpperCase()}
                                        </div>
                                        <span className={styles.userName}>
                                            {u.nombre}
                                        </span>
                                    </td>
                                    <td className={styles.emailCell}>
                                        {u.email}
                                    </td>
                                    <td>
                                        <span
                                            className={`${styles.rolBadge} ${rolBadgeClass(u.rol)}`}
                                        >
                                            {u.rol}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={styles.estadoActivo}>
                                            Activo
                                        </span>
                                    </td>
                                    <td className={styles.actionsCell}>
                                        <button
                                            className={styles.btnEdit}
                                            onClick={() => abrirEdicion(u)}
                                            title="Editar usuario"
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
                                                desactivarMutation.mutate(u.id)
                                            }
                                            title="Desactivar usuario"
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
                                <td colSpan={5} className={styles.emptyState}>
                                    No hay usuarios activos en el sistema.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={cerrarModal}
                title={editingId ? 'Editar Usuario' : 'Registrar Nuevo Usuario'}
            >
                <form onSubmit={handleSubmit} className={styles.formGrid}>
                    <div className={styles.field}>
                        <label htmlFor="input-nombre">Nombre Completo</label>
                        <input
                            id="input-nombre"
                            placeholder="Ej: María López"
                            value={form.nombre}
                            onChange={(e) =>
                                setForm({ ...form, nombre: e.target.value })
                            }
                            required
                        />
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="input-email">Correo Electrónico</label>
                        <input
                            id="input-email"
                            type="email"
                            placeholder="nombre@garritafeliz.com"
                            value={form.email}
                            onChange={(e) =>
                                setForm({ ...form, email: e.target.value })
                            }
                            required
                        />
                    </div>

                    <div className={styles.formRow}>
                        <div className={styles.field}>
                            <label htmlFor="input-password">
                                {editingId
                                    ? 'Nueva Contraseña (opcional)'
                                    : 'Contraseña'}
                            </label>
                            <input
                                id="input-password"
                                type="password"
                                placeholder={
                                    editingId
                                        ? 'Dejar en blanco'
                                        : 'Mínimo 6 caracteres'
                                }
                                value={form.password}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        password: e.target.value,
                                    })
                                }
                                minLength={6}
                                required={!editingId}
                            />
                        </div>
                        <div className={styles.field}>
                            <label htmlFor="select-rol">Rol</label>
                            <select
                                id="select-rol"
                                value={form.rol}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        rol: e.target.value as Usuario['rol'],
                                    })
                                }
                            >
                                {ROLES.map((rol) => (
                                    <option key={rol} value={rol}>
                                        {rol}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {isError && (
                        <p className={styles.errorMsg}>
                            {getErrorMessage(
                                error,
                                'No se pudo guardar el usuario.',
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
                              : 'Crear Usuario'}
                    </button>
                </form>
            </Modal>
        </div>
    );
}
