import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getCitas,
    createCita,
    updateCitaEstado,
    type Cita,
} from '../../api/citas.api';
import { getMascotas } from '../../api/mascotas.api';
import { getUsuarios } from '../../api/usuarios.api';
import { ConsultaForm } from '../consultas/ConsultaForm';
import { useAuthStore } from '../auth/useAuthStore';

export function CitasPage() {
    const queryClient = useQueryClient();
    const { data: citas, isLoading } = useQuery({
        queryKey: ['citas'],
        queryFn: getCitas,
    });
    const { data: mascotas } = useQuery({
        queryKey: ['mascotas'],
        queryFn: getMascotas,
    });
    const { data: usuarios } = useQuery({
        queryKey: ['usuarios'],
        queryFn: getUsuarios,
    });

    const usuario = useAuthStore((s) => s.usuario);
    const puedeCrear = usuario ? ['GERENTE', 'RECEPCION'].includes(usuario.rol) : false;

    const [form, setForm] = useState({
        mascotaId: '',
        usuarioId: '',
        fecha: '',
        motivo: '',
    });
    const [citaParaAtender, setCitaParaAtender] = useState<string | null>(null);

    const veterinarios = usuarios?.filter((u) => u.rol === 'VETERINARIO');

    const createMutation = useMutation({
        mutationFn: createCita,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['citas'] });
            setForm({ mascotaId: '', usuarioId: '', fecha: '', motivo: '' });
        },
    });

    const cancelarMutation = useMutation({
        mutationFn: (id: string) => updateCitaEstado(id, 'CANCELADA'),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['citas'] }),
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate({
            ...form,
            fecha: new Date(form.fecha).toISOString(),
        });
    };

    if (isLoading) return <p>Cargando...</p>;

    return (
        <div>
            <h2>Citas</h2>

            {puedeCrear && (
            <form
                onSubmit={handleSubmit}
                style={{
                    marginBottom: 20,
                    display: 'flex',
                    gap: 8,
                    flexWrap: 'wrap',
                }}
            >
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

            <table border={1} cellPadding={8} style={{ width: '100%' }}>
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
