import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getMascotas,
    createMascota,
    deleteMascota,
    type Mascota,
} from '../../api/mascotas.api';
import { getClientes } from '../../api/clientes.api';
import { useAuthStore } from '../auth/useAuthStore';

export function MascotasPage() {
    const queryClient = useQueryClient();
    const { data: mascotas, isLoading } = useQuery({
        queryKey: ['mascotas'],
        queryFn: getMascotas,
    });
    const { data: clientes } = useQuery({
        queryKey: ['clientes'],
        queryFn: getClientes,
    });

    const usuario = useAuthStore((s) => s.usuario);
    const puedeCrear = usuario ? ['GERENTE', 'RECEPCION'].includes(usuario.rol) : false;

    const [form, setForm] = useState({
        nombre: '',
        especie: '',
        raza: '',
        sexo: 'MACHO',
        fechaNac: '',
        peso: '',
        clienteId: '',
    });
    const [imagen, setImagen] = useState<File | null>(null);

    const createMutation = useMutation({
        mutationFn: createMascota,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['mascotas'] });
            setForm({
                nombre: '',
                especie: '',
                raza: '',
                sexo: 'MACHO',
                fechaNac: '',
                peso: '',
                clienteId: '',
            });
            setImagen(null);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteMascota,
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: ['mascotas'] }),
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const data = new FormData();
        Object.entries(form).forEach(([key, value]) => {
            if (value) data.append(key, value);
        });
        if (imagen) data.append('imagen', imagen);
        createMutation.mutate(data);
    };

    if (isLoading) return <p>Cargando...</p>;

    return (
        <div>
            <h2>Mascotas</h2>

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
                <input
                    placeholder="Nombre"
                    value={form.nombre}
                    onChange={(e) =>
                        setForm({ ...form, nombre: e.target.value })
                    }
                    required
                />
                <input
                    placeholder="Especie"
                    value={form.especie}
                    onChange={(e) =>
                        setForm({ ...form, especie: e.target.value })
                    }
                    required
                />
                <input
                    placeholder="Raza"
                    value={form.raza}
                    onChange={(e) => setForm({ ...form, raza: e.target.value })}
                />
                <select
                    value={form.sexo}
                    onChange={(e) => setForm({ ...form, sexo: e.target.value })}
                >
                    <option value="MACHO">Macho</option>
                    <option value="HEMBRA">Hembra</option>
                </select>
                <input
                    type="date"
                    value={form.fechaNac}
                    onChange={(e) =>
                        setForm({ ...form, fechaNac: e.target.value })
                    }
                />
                <input
                    type="number"
                    step="0.1"
                    placeholder="Peso (kg)"
                    value={form.peso}
                    onChange={(e) => setForm({ ...form, peso: e.target.value })}
                />
                <select
                    value={form.clienteId}
                    onChange={(e) =>
                        setForm({ ...form, clienteId: e.target.value })
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
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImagen(e.target.files?.[0] ?? null)}
                />
                <button type="submit">Agregar</button>
            </form>
            )}

            <table border={1} cellPadding={8} style={{ width: '100%' }}>
                <thead>
                    <tr>
                        <th>Foto</th>
                        <th>Nombre</th>
                        <th>Especie</th>
                        <th>Dueño</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {mascotas?.map((m: Mascota) => (
                        <tr key={m.id}>
                            <td>
                                {m.imagenUrl ? (
                                    <img
                                        src={m.imagenUrl}
                                        width={50}
                                        height={50}
                                        style={{ objectFit: 'cover' }}
                                    />
                                ) : (
                                    '-'
                                )}
                            </td>
                            <td>{m.nombre}</td>
                            <td>{m.especie}</td>
                            <td>{m.cliente?.nombre ?? '-'}</td>
                            <td>
                                <button
                                    onClick={() => deleteMutation.mutate(m.id)}
                                >
                                    Eliminar
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
