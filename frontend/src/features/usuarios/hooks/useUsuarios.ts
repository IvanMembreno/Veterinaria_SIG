import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    createUsuario,
    desactivarUsuario,
    getUsuarios,
    updateUsuario,
    type Usuario,
    type UpdateUsuarioPayload,
} from '../../../api/usuarios.api';
import type { Role } from '../../auth/useAuthStore';

const initialForm: {
    nombre: string;
    email: string;
    password: string;
    rol: Role;
} = {
    nombre: '',
    email: '',
    password: '',
    rol: 'RECEPCION',
};

export function useUsuarios() {
    const queryClient = useQueryClient();
    const { data: usuarios, isLoading } = useQuery({
        queryKey: ['usuarios'],
        queryFn: getUsuarios,
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState(initialForm);

    const invalidar = () =>
        queryClient.invalidateQueries({ queryKey: ['usuarios'] });

    const cerrarModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setForm(initialForm);
    };

    const createMutation = useMutation({
        mutationFn: createUsuario,
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
            data: UpdateUsuarioPayload;
        }) => updateUsuario(id, data),
        onSuccess: () => {
            invalidar();
            cerrarModal();
        },
    });

    const desactivarMutation = useMutation({
        mutationFn: desactivarUsuario,
        onSuccess: invalidar,
    });

    const abrirNuevo = () => {
        setEditingId(null);
        setForm(initialForm);
        setIsModalOpen(true);
    };

    const abrirEdicion = (usuario: Usuario) => {
        setEditingId(usuario.id);
        setForm({
            nombre: usuario.nombre,
            email: usuario.email,
            password: '',
            rol: usuario.rol,
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingId) {
            const data: UpdateUsuarioPayload = {
                nombre: form.nombre,
                email: form.email,
                rol: form.rol,
            };
            if (form.password) data.password = form.password;
            updateMutation.mutate({ id: editingId, data });
        } else {
            createMutation.mutate(form);
        }
    };

    return {
        usuarios,
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
        isSaving: createMutation.isPending || updateMutation.isPending,
        isError: createMutation.isError || updateMutation.isError,
        error: createMutation.error ?? updateMutation.error,
    };
}
