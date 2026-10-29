import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    createServicio,
    desactivarServicio,
    getServiciosAdmin,
    reactivarServicio,
    updateServicio,
    type Servicio,
    type UpdateServicioPayload,
} from '../../../api/servicios.api';

const initialForm = { nombre: '', precio: '' };

export function useServicios() {
    const queryClient = useQueryClient();
    const { data: servicios, isLoading } = useQuery({
        // Clave propia: consulta y ventas usan ['servicios'] solo con activos.
        // Invalidar ['servicios'] refresca ambas cachés.
        queryKey: ['servicios', 'admin'],
        queryFn: getServiciosAdmin,
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState(initialForm);

    const invalidar = () =>
        queryClient.invalidateQueries({ queryKey: ['servicios'] });

    const cerrarModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setForm(initialForm);
    };

    const createMutation = useMutation({
        mutationFn: createServicio,
        onSuccess: () => {
            invalidar();
            cerrarModal();
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: string;
            data: UpdateServicioPayload;
        }) => updateServicio(id, data),
        onSuccess: () => {
            invalidar();
            cerrarModal();
        },
    });

    const desactivarMutation = useMutation({
        mutationFn: desactivarServicio,
        onSuccess: invalidar,
    });

    const reactivarMutation = useMutation({
        mutationFn: reactivarServicio,
        onSuccess: invalidar,
    });

    const abrirNuevo = () => {
        setEditingId(null);
        setForm(initialForm);
        setIsModalOpen(true);
    };

    const abrirEdicion = (servicio: Servicio) => {
        setEditingId(servicio.id);
        setForm({
            nombre: servicio.nombre,
            precio: String(servicio.precio),
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const data = { nombre: form.nombre, precio: Number(form.precio) };
        if (editingId) {
            updateMutation.mutate({ id: editingId, data });
        } else {
            createMutation.mutate(data);
        }
    };

    return {
        servicios,
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
        reactivarMutation,
        totalActivos: servicios?.filter((s) => s.activo).length ?? 0,
        isSaving: createMutation.isPending || updateMutation.isPending,
        isError: createMutation.isError || updateMutation.isError,
        error: createMutation.error ?? updateMutation.error,
    };
}
