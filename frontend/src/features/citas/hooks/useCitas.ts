import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCitas, createCita, updateCitaEstado } from '../../../api/citas.api';
import { getMascotas } from '../../../api/mascotas.api';
import { getUsuarios } from '../../../api/usuarios.api';
import { useAuthStore } from '../../auth/useAuthStore';

const initialForm = { mascotaId: '', usuarioId: '', fecha: '', motivo: '' };

export function useCitas() {
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
    const puedeCrear = usuario
        ? ['GERENTE', 'RECEPCION'].includes(usuario.rol)
        : false;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form, setForm] = useState(initialForm);
    const [citaParaAtender, setCitaParaAtender] = useState<string | null>(null);

    const veterinarios = usuarios?.filter((u) => u.rol === 'VETERINARIO');

    const createMutation = useMutation({
        mutationFn: createCita,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['citas'] });
            setForm(initialForm);
            setIsModalOpen(false);
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

    return {
        citas,
        mascotas,
        veterinarios,
        isLoading,
        puedeCrear,
        isModalOpen,
        setIsModalOpen,
        form,
        setForm,
        citaParaAtender,
        setCitaParaAtender,
        cancelarMutation,
        handleSubmit,
    };
}
