import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getClientes,
    createCliente,
    updateCliente,
    deleteCliente,
    type Cliente,
} from '../../../api/clientes.api';
import { useAuthStore } from '../../auth/useAuthStore';

const initialForm = { nombre: '', telefono: '', email: '', direccion: '' };

export function useClientes() {
    const queryClient = useQueryClient();
    const { data: clientes, isLoading } = useQuery({
        queryKey: ['clientes'],
        queryFn: getClientes,
    });

    const usuario = useAuthStore((s) => s.usuario);
    const puedeCrear = usuario
        ? ['GERENTE', 'RECEPCION'].includes(usuario.rol)
        : false;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState(initialForm);

    const invalidar = () =>
        queryClient.invalidateQueries({ queryKey: ['clientes'] });

    const cerrarModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setForm(initialForm);
    };

    const createMutation = useMutation({
        mutationFn: createCliente,
        onSuccess: () => {
            invalidar();
            cerrarModal();
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Cliente> }) =>
            updateCliente(id, data),
        onSuccess: () => {
            invalidar();
            cerrarModal();
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteCliente,
        onSuccess: invalidar,
    });

    const abrirNuevo = () => {
        setEditingId(null);
        setForm(initialForm);
        setIsModalOpen(true);
    };

    const abrirEdicion = (cliente: Cliente) => {
        setEditingId(cliente.id);
        setForm({
            nombre: cliente.nombre,
            telefono: cliente.telefono,
            email: cliente.email ?? '',
            direccion: cliente.direccion ?? '',
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingId) {
            updateMutation.mutate({ id: editingId, data: form });
        } else {
            createMutation.mutate(form);
        }
    };

    return {
        clientes,
        isLoading,
        puedeCrear,
        isModalOpen,
        editingId,
        form,
        setForm,
        abrirNuevo,
        abrirEdicion,
        cerrarModal,
        deleteMutation,
        handleSubmit,
        isSaving: createMutation.isPending || updateMutation.isPending,
    };
}
