import { useNavigate } from 'react-router-dom';
import { useMascotas } from './hooks/useMascotas';
import { ESPECIE_OTRA, ESPECIES } from './especies';
import { useAuthStore } from '../auth/useAuthStore';
import { type Mascota } from '../../api/mascotas.api';
import { Modal } from '../../components/ui/Modal';
import { Autocomplete } from '../../components/ui/Autocomplete';
import styles from './styles/mascotas.module.css';
import basurero from '../../assets/actions/trash.svg';
import lapiz from '../../assets/actions/pencil.svg';

export function MascotasPage() {
    const navigate = useNavigate();
    const usuario = useAuthStore((s) => s.usuario);
    const puedeVerDetalle = usuario
        ? ['GERENTE', 'VETERINARIO'].includes(usuario.rol)
        : false;
    const {
        mascotas,
        clientes,
        isLoading,
        puedeCrear,
        isModalOpen,
        editingId,
        form,
        setForm,
        especieSeleccion,
        elegirEspecie,
        imagen,
        setImagen,
        abrirNuevo,
        abrirEdicion,
        cerrarModal,
        deleteMutation,
        handleSubmit,
        isSaving,
    } = useMascotas();

    if (isLoading) {
        return (
            <div className={styles.loaderContainer}>
                <p>Reuniendo a los pacientes de La Garrita Feliz...</p>
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
                    <h1 className={styles.mainTitle}>Mascotas Registradas</h1>
                    <p className={styles.subtitle}>
                        Administra la ficha básica de cada paciente y su dueño.
                    </p>
                </div>
                <div className={styles.headerActions}>
                    <div className={styles.statsBadge}>
                        Total pacientes: <b>{mascotas?.length || 0}</b>
                    </div>
                    {puedeCrear && (
                        <button className={styles.newBtn} onClick={abrirNuevo}>
                            + Nueva Mascota
                        </button>
                    )}
                </div>
            </header>

            <div className={styles.card}>
                <table className={styles.mascotasTable}>
                    <thead>
                        <tr>
                            <th>Mascota</th>
                            <th>Especie / Raza</th>
                            <th className={styles.textCenter}>Sexo</th>
                            <th>Propietario</th>
                            <th className={styles.textCenter}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mascotas && mascotas.length > 0 ? (
                            mascotas.map((m: Mascota) => (
                                <tr
                                    key={m.id}
                                    className={
                                        puedeVerDetalle
                                            ? styles.tableRow
                                            : styles.tableRowStatic
                                    }
                                    onClick={
                                        puedeVerDetalle
                                            ? () =>
                                                  navigate(`/mascotas/${m.id}`)
                                            : undefined
                                    }
                                >
                                    <td className={styles.petCell}>
                                        <div className={styles.cellContent}>
                                            {m.imagenUrl ? (
                                                <img
                                                    src={m.imagenUrl}
                                                    alt=""
                                                    className={styles.petPhoto}
                                                />
                                            ) : (
                                                <div className={styles.avatar}>
                                                    {m.nombre
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                </div>
                                            )}
                                            <span className={styles.petName}>
                                                {m.nombre}
                                            </span>
                                        </div>
                                    </td>
                                    <td className={styles.speciesCell}>
                                        <span className={styles.speciesText}>
                                            {m.especie}
                                        </span>
                                        {m.raza && (
                                            <small className={styles.breedText}>
                                                {m.raza}
                                            </small>
                                        )}
                                    </td>
                                    <td className={styles.textCenter}>
                                        <span
                                            className={`${styles.sexBadge} ${m.sexo === 'MACHO' ? styles.sexMacho : styles.sexHembra}`}
                                        >
                                            {m.sexo}
                                        </span>
                                    </td>
                                    <td className={styles.ownerCell}>
                                        {m.cliente?.nombre ?? (
                                            <span className={styles.noData}>
                                                - Sin asignar -
                                            </span>
                                        )}
                                    </td>
                                    <td className={styles.actionsCell}>
                                        <div className={styles.actionsGroup}>
                                            {puedeVerDetalle && (
                                                <button
                                                    className={
                                                        styles.btnHistorial
                                                    }
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(
                                                            `/mascotas/${m.id}`,
                                                        );
                                                    }}
                                                    title="Ver historial clínico"
                                                >
                                                    Historial
                                                </button>
                                            )}
                                            {puedeCrear && (
                                                <button
                                                    className={styles.btnEdit}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        abrirEdicion(m);
                                                    }}
                                                    title="Editar mascota"
                                                >
                                                    <img
                                                        src={lapiz}
                                                        alt=""
                                                        className={
                                                            styles.actionIcon
                                                        }
                                                    />
                                                    Editar
                                                </button>
                                            )}
                                            <button
                                                className={styles.btnDelete}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteMutation.mutate(m.id);
                                                }}
                                                title="Eliminar mascota permanente"
                                            >
                                                <img
                                                    src={basurero}
                                                    alt=""
                                                    className={styles.trash}
                                                />
                                                Eliminar
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className={styles.emptyState}>
                                    No hay mascotas registradas en el sistema.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={cerrarModal}
                title={editingId ? 'Editar Mascota' : 'Registrar Nueva Mascota'}
            >
                <form onSubmit={handleSubmit} className={styles.formGrid}>
                    <div className={styles.formRow}>
                        <div className={styles.field}>
                            <label htmlFor="input-nombre">Nombre</label>
                            <input
                                id="input-nombre"
                                placeholder="Ej: Firulais"
                                value={form.nombre}
                                onChange={(e) =>
                                    setForm({ ...form, nombre: e.target.value })
                                }
                                required
                            />
                        </div>
                        <div className={styles.field}>
                            <label htmlFor="select-sexo">Sexo</label>
                            <select
                                id="select-sexo"
                                value={form.sexo}
                                onChange={(e) =>
                                    setForm({ ...form, sexo: e.target.value })
                                }
                            >
                                <option value="MACHO">Macho</option>
                                <option value="HEMBRA">Hembra</option>
                            </select>
                        </div>
                    </div>

                    <div className={styles.formRow}>
                        <div className={styles.field}>
                            <label htmlFor="select-especie">Especie</label>
                            <select
                                id="select-especie"
                                value={especieSeleccion}
                                onChange={(e) => elegirEspecie(e.target.value)}
                                required
                            >
                                <option value="">-- Especie --</option>
                                {ESPECIES.map((especie) => (
                                    <option key={especie} value={especie}>
                                        {especie}
                                    </option>
                                ))}
                            </select>
                            {especieSeleccion === ESPECIE_OTRA && (
                                <input
                                    id="input-especie-otra"
                                    aria-label="Especie (otra)"
                                    placeholder="Escribe la especie"
                                    value={form.especie}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            especie: e.target.value,
                                        })
                                    }
                                    required
                                />
                            )}
                        </div>
                        <div className={styles.field}>
                            <label htmlFor="input-raza">Raza</label>
                            <input
                                id="input-raza"
                                placeholder="Ej: Labrador"
                                value={form.raza}
                                onChange={(e) =>
                                    setForm({ ...form, raza: e.target.value })
                                }
                            />
                        </div>
                    </div>

                    <div className={styles.formRow}>
                        <div className={styles.field}>
                            <label htmlFor="input-fecha">
                                Fecha de Nacimiento
                            </label>
                            <input
                                id="input-fecha"
                                type="date"
                                value={form.fechaNac}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        fechaNac: e.target.value,
                                    })
                                }
                            />
                        </div>
                        <div className={styles.field}>
                            <label htmlFor="input-peso">Peso (kg)</label>
                            <input
                                id="input-peso"
                                type="number"
                                step="0.1"
                                placeholder="0.0"
                                value={form.peso}
                                onChange={(e) =>
                                    setForm({ ...form, peso: e.target.value })
                                }
                            />
                        </div>
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="select-cliente">Propietario</label>
                        <Autocomplete
                            id="select-cliente"
                            placeholder="Escribe el nombre del cliente"
                            options={(clientes ?? []).map((c) => ({
                                value: c.id,
                                label: c.nombre,
                                hint: c.telefono,
                            }))}
                            value={form.clienteId}
                            onChange={(clienteId) =>
                                setForm({ ...form, clienteId })
                            }
                            required
                        />
                    </div>

                    <div className={styles.field}>
                        <label
                            htmlFor="input-imagen"
                            className={styles.fileLabel}
                        >
                            <span className={styles.fileIconPlaceholder}>
                                📷
                            </span>
                            {imagen
                                ? imagen.name
                                : editingId
                                  ? 'Cambiar foto (opcional)'
                                  : 'Subir foto (opcional)'}
                        </label>
                        <input
                            id="input-imagen"
                            type="file"
                            accept="image/*"
                            className={styles.fileInput}
                            onChange={(e) =>
                                setImagen(e.target.files?.[0] ?? null)
                            }
                        />
                    </div>

                    <button
                        type="submit"
                        className={styles.submitBtn}
                        disabled={isSaving}
                    >
                        {isSaving
                            ? 'Guardando...'
                            : editingId
                              ? 'Guardar Cambios'
                              : 'Agregar Mascota'}
                    </button>
                </form>
            </Modal>
        </div>
    );
}
