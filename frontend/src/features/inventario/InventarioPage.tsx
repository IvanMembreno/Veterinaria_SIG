import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getInventario,
    createInsumo,
    registrarEntrada,
    type Insumo,
} from '../../api/inventario.api';
import { useAuthStore } from '../auth/useAuthStore';

export function InventarioPage() {
    const queryClient = useQueryClient();
    const { data: insumos, isLoading } = useQuery({
        queryKey: ['inventario'],
        queryFn: getInventario,
    });

    const usuario = useAuthStore((s) => s.usuario);
    const puedeCrear = usuario ? ['GERENTE', 'RECEPCION'].includes(usuario.rol) : false;

    const [form, setForm] = useState({
        nombre: '',
        lote: '',
        fechaVenc: '',
        stock: '',
        stockMinimo: '5',
        precioUnit: '',
    });
    const [entradas, setEntradas] = useState<Record<string, string>>({});

    const createMutation = useMutation({
        mutationFn: createInsumo,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inventario'] });
            setForm({
                nombre: '',
                lote: '',
                fechaVenc: '',
                stock: '',
                stockMinimo: '5',
                precioUnit: '',
            });
        },
    });

    const entradaMutation = useMutation({
        mutationFn: ({ id, cantidad }: { id: string; cantidad: number }) =>
            registrarEntrada(id, cantidad),
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: ['inventario'] }),
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate({
            nombre: form.nombre,
            lote: form.lote || undefined,
            fechaVenc: form.fechaVenc || undefined,
            stock: Number(form.stock),
            stockMinimo: Number(form.stockMinimo),
            precioUnit: Number(form.precioUnit),
        });
    };

    if (isLoading) return <p>Cargando...</p>;

    return (
        <div>
            <h2>Inventario</h2>

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
                    placeholder="Lote"
                    value={form.lote}
                    onChange={(e) => setForm({ ...form, lote: e.target.value })}
                />
                <input
                    type="date"
                    value={form.fechaVenc}
                    onChange={(e) =>
                        setForm({ ...form, fechaVenc: e.target.value })
                    }
                />
                <input
                    type="number"
                    placeholder="Stock inicial"
                    value={form.stock}
                    onChange={(e) =>
                        setForm({ ...form, stock: e.target.value })
                    }
                    required
                />
                <input
                    type="number"
                    placeholder="Stock mínimo"
                    value={form.stockMinimo}
                    onChange={(e) =>
                        setForm({ ...form, stockMinimo: e.target.value })
                    }
                />
                <input
                    type="number"
                    step="0.01"
                    placeholder="Precio unitario"
                    value={form.precioUnit}
                    onChange={(e) =>
                        setForm({ ...form, precioUnit: e.target.value })
                    }
                    required
                />
                <button type="submit">Agregar insumo</button>
            </form>
            )}

            <table border={1} cellPadding={8} style={{ width: '100%' }}>
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Lote</th>
                        <th>Vence</th>
                        <th>Stock</th>
                        <th>Mínimo</th>
                        <th>Registrar entrada</th>
                    </tr>
                </thead>
                <tbody>
                    {insumos?.map((i: Insumo) => (
                        <tr
                            key={i.id}
                            style={{
                                background:
                                    i.stock <= i.stockMinimo
                                        ? '#fee2e2'
                                        : 'white',
                            }}
                        >
                            <td>{i.nombre}</td>
                            <td>{i.lote ?? '-'}</td>
                            <td>
                                {i.fechaVenc
                                    ? new Date(i.fechaVenc).toLocaleDateString()
                                    : '-'}
                            </td>
                            <td>{i.stock}</td>
                            <td>{i.stockMinimo}</td>
                            <td>
                                <input
                                    type="number"
                                    style={{ width: 60 }}
                                    value={entradas[i.id] ?? ''}
                                    onChange={(e) =>
                                        setEntradas({
                                            ...entradas,
                                            [i.id]: e.target.value,
                                        })
                                    }
                                />
                                <button
                                    onClick={() =>
                                        entradaMutation.mutate({
                                            id: i.id,
                                            cantidad: Number(entradas[i.id]),
                                        })
                                    }
                                >
                                    Agregar
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
