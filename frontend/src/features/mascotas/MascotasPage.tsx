import { useMascotas } from './hooks/useMascotas';
import { type Mascota } from '../../api/mascotas.api';
import styles from './styles/mascotas.module.css';
import basurero from '../../assets/actions/trash.svg';
import huella from '../../assets/pets.svg';

export function MascotasPage() {
    const {
        mascotas,
        clientes,
        isLoading,
        puedeCrear,
        form,
        setForm,
        imagen,
        setImagen,
        deleteMutation,
        handleSubmit,
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
                        Administra la ficha básica de cada paciente y su
                        dueño.
                    </p>
                </div>
                <div className={styles.statsBadge}>
                    <span>
                        Total pacientes: <b>{mascotas?.length || 0}</b>
                    </span>
                </div>
            </header>

            {puedeCrear && (
                <section className={styles.bookingBanner}>
                    <h3 className={styles.bannerTitle}>
                        Registrar Nueva Mascota
                    </h3>
                    <form onSubmit={handleSubmit} className={styles.formGrid}>
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
                            <label htmlFor="input-especie">Especie</label>
                            <input
                                id="input-especie"
                                placeholder="Ej: Canino"
                                value={form.especie}
                                onChange={(e) =>
                                    setForm({ ...form, especie: e.target.value })
                                }
                                required
                            />
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

                        <div className={styles.field}>
                            <label htmlFor="input-fecha">
                                Fecha de Nacimiento
                            </label>
                            <input
                                id="input-fecha"
                                type="date"
                                value={form.fechaNac}
                                onChange={(e) =>
                                    setForm({ ...form, fechaNac: e.target.value })
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

                        <div className={styles.field}>
                            <label htmlFor="select-cliente">Propietario</label>
                            <select
                                id="select-cliente"
                                value={form.clienteId}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        clienteId: e.target.value,
                                    })
                                }
                                required
                            >
                                <option value="">-- Cliente --</option>
                                {clientes?.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.field}>
                            <label htmlFor="input-imagen" className={styles.fileLabel}>
                                <span className={styles.fileIconPlaceholder}>
                                    📷
                                </span>
                                {imagen ? imagen.name : 'Subir foto'}
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

                        <button type="submit" className={styles.submitBtn}>
                            Agregar Mascota
                        </button>
                    </form>
                </section>
            )}

            <div className={styles.tableResponsive}>
                <table className={styles.mascotasTable}>
                    <thead>
                        <tr>
                            <th>Foto</th>
                            <th>Nombre</th>
                            <th>Especie / Raza</th>
                            <th>Sexo</th>
                            <th>Propietario</th>
                            <th className={styles.textCenter}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mascotas && mascotas.length > 0 ? (
                            mascotas.map((m: Mascota) => (
                                <tr key={m.id} className={styles.tableRow}>
                                    <td className={styles.photoCell}>
                                        {m.imagenUrl ? (
                                            <img
                                                src={m.imagenUrl}
                                                alt=""
                                                className={styles.petPhoto}
                                            />
                                        ) : (
                                            <div className={styles.petPhotoPlaceholder}>
                                                <img
                                                    src={huella}
                                                    alt=""
                                                    className={styles.petIcon}
                                                />
                                            </div>
                                        )}
                                    </td>
                                    <td className={styles.petNameCell}>
                                        {m.nombre}
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
                                    <td>
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
                                        <button
                                            className={styles.btnDelete}
                                            onClick={() =>
                                                deleteMutation.mutate(m.id)
                                            }
                                            title="Eliminar mascota permanente"
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
                                <td colSpan={6} className={styles.emptyState}>
                                    No hay mascotas registradas en el sistema.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
