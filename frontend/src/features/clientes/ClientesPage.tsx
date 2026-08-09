import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getClientes,
    createCliente,
    deleteCliente,
    type Cliente,
} from '../../api/clientes.api';
import { useAuthStore } from '../auth/useAuthStore';

export function ClientesPage() {
    const queryClient = useQueryClient();
    const { data: clientes, isLoading } = useQuery({
        queryKey: ['clientes'],
        queryFn: getClientes,
    });

    const usuario = useAuthStore((s) => s.usuario);
    const puedeCrear = usuario ? ['GERENTE', 'RECEPCION'].includes(usuario.rol) : false;

    const [form, setForm] = useState({
        nombre: '',
        telefono: '',
        email: '',
        direccion: '',
    });

    const createMutation = useMutation({
        mutationFn: createCliente,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clientes'] });
            setForm({ nombre: '', telefono: '', email: '', direccion: '' });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteCliente,
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: ['clientes'] }),
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate(form);
    };

    if (isLoading) return <p>Cargando...</p>;

    return (
        <div>
            <h2>Clientes</h2>

            {puedeCrear && (
            <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
                <input
                    placeholder="Nombre"
                    value={form.nombre}
                    onChange={(e) =>
                        setForm({ ...form, nombre: e.target.value })
                    }
                    required
                />
                <input
                    placeholder="Teléfono"
                    value={form.telefono}
                    onChange={(e) =>
                        setForm({ ...form, telefono: e.target.value })
                    }
                    required
                />
                <input
                    placeholder="Email"
                    value={form.email}
                    onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                    }
                />
                <input
                    placeholder="Dirección"
                    value={form.direccion}
                    onChange={(e) =>
                        setForm({ ...form, direccion: e.target.value })
                    }
                />
                <button type="submit">Agregar</button>
            </form>
            )}
            
            <table border={1} cellPadding={8} style={{ width: '100%' }}>
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Teléfono</th>
                        <th>Email</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {clientes?.map((c: Cliente) => (
                        <tr key={c.id}>
                            <td>{c.nombre}</td>
                            <td>{c.telefono}</td>
                            <td>{c.email ?? '-'}</td>
                            <td>
                                <button
                                    onClick={() => deleteMutation.mutate(c.id)}
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
