import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getClientes,
    createCliente,
    deleteCliente,
} from '../../../api/clientes.api';
import { useAuthStore } from '../../auth/useAuthStore';

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

    return {
        clientes,
        isLoading,
        puedeCrear,
        form,
        setForm,
        deleteMutation,
        handleSubmit,
    };
}
