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

    if (isLoading) return <p>Cargando...</p>;

    return (
        <div>
            <h2>Citas</h2>

            {puedeCrear && (
                <form onSubmit={handleSubmit} className={styles.formInline}>
                    <select
                        value={form.mascotaId}
                        onChange={(e) =>
                            setForm({ ...form, mascotaId: e.target.value })
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
                    <select
                        value={form.usuarioId}
                        onChange={(e) =>
                            setForm({ ...form, usuarioId: e.target.value })
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
                    <input
                        type="datetime-local"
                        value={form.fecha}
                        onChange={(e) =>
                            setForm({ ...form, fecha: e.target.value })
                        }
                        required
                    />
                    <input
                        placeholder="Motivo"
                        value={form.motivo}
                        onChange={(e) =>
                            setForm({ ...form, motivo: e.target.value })
                        }
                        required
                    />
                    <button type="submit">Agendar</button>
                </form>
            )}

            <table border={1} cellPadding={8} className={styles.citasTable}>
                <thead>
                    <tr>
                        <th>Mascota</th>
                        <th>Veterinario</th>
                        <th>Fecha</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {citas?.map((c: Cita) => (
                        <tr key={c.id}>
                            <td>{c.mascota?.nombre}</td>
                            <td>{c.usuario?.nombre}</td>
                            <td>{new Date(c.fecha).toLocaleString()}</td>
                            <td>{c.estado}</td>
                            <td>
                                {c.estado === 'PROGRAMADA' ||
                                c.estado === 'CONFIRMADA' ? (
                                    <>
                                        <button
                                            onClick={() =>
                                                setCitaParaAtender(c.id)
                                            }
                                        >
                                            Atender
                                        </button>
                                        <button
                                            onClick={() =>
                                                cancelarMutation.mutate(c.id)
                                            }
                                        >
                                            Cancelar
                                        </button>
                                    </>
                                ) : (
                                    '-'
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {citaParaAtender && (
                <ConsultaForm
                    citaId={citaParaAtender}
                    onClose={() => setCitaParaAtender(null)}
                />
            )}
        </div>
    );
}
