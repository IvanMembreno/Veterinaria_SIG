import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getInventario,
    createInsumo,
    updateInsumo,
    registrarEntrada,
    type Insumo,
    type UpdateInsumoPayload,
} from '../../../api/inventario.api';
import { useAuthStore } from '../../auth/useAuthStore';

const initialForm = {
    nombre: '',
    lote: '',
    fechaVenc: '',
    stock: '',
    stockMinimo: '5',
    precioUnit: '',
};

export function useInventario() {
    const queryClient = useQueryClient();
    const { data: insumos, isLoading } = useQuery({
        queryKey: ['inventario'],
        queryFn: getInventario,
    });

    const usuario = useAuthStore((s) => s.usuario);
    const puedeCrear = usuario
        ? ['GERENTE', 'RECEPCION'].includes(usuario.rol)
        : false;

    const puedeEditar = usuario
        ? ['GERENTE', 'INVENTARIO'].includes(usuario.rol)
        : false;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState(initialForm);
    const [entradas, setEntradas] = useState<Record<string, string>>({});

    const cerrarModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setForm(initialForm);
    };

    const createMutation = useMutation({
        mutationFn: createInsumo,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inventario'] });
            cerrarModal();
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateInsumoPayload }) =>
            updateInsumo(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inventario'] });
            cerrarModal();
        },
    });

    const entradaMutation = useMutation({
        mutationFn: ({ id, cantidad }: { id: string; cantidad: number }) =>
            registrarEntrada(id, cantidad),
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: ['inventario'] }),
    });

    const abrirNuevo = () => {
        setEditingId(null);
        setForm(initialForm);
        setIsModalOpen(true);
    };

    const abrirEdicion = (insumo: Insumo) => {
        setEditingId(insumo.id);
        setForm({
            nombre: insumo.nombre,
            lote: insumo.lote ?? '',
            fechaVenc: insumo.fechaVenc ? insumo.fechaVenc.slice(0, 10) : '',
            stock: String(insumo.stock),
            stockMinimo: String(insumo.stockMinimo),
            precioUnit: String(insumo.precioUnit),
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingId) {
            // El stock no se envía: solo cambia por entradas, consultas o ventas.
            updateMutation.mutate({
                id: editingId,
                data: {
                    nombre: form.nombre,
                    lote: form.lote || null,
                    fechaVenc: form.fechaVenc || null,
                    stockMinimo: Number(form.stockMinimo),
                    precioUnit: Number(form.precioUnit),
                },
            });
            return;
        }
        createMutation.mutate({
            nombre: form.nombre,
            lote: form.lote || undefined,
            fechaVenc: form.fechaVenc || undefined,
            stock: Number(form.stock),
            stockMinimo: Number(form.stockMinimo),
            precioUnit: Number(form.precioUnit),
        });
    };

    return {
        insumos,
        isLoading,
        puedeCrear,
        puedeEditar,
        isModalOpen,
        editingId,
        abrirNuevo,
        abrirEdicion,
        cerrarModal,
        form,
        setForm,
        entradas,
        setEntradas,
        entradaMutation,
        handleSubmit,
        isSaving: createMutation.isPending || updateMutation.isPending,
        isError: createMutation.isError || updateMutation.isError,
        error: createMutation.error ?? updateMutation.error,
    };
}
