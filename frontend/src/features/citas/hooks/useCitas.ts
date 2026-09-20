import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getCitas,
    createCita,
    updateCitaEstado,
    type Cita,
} from '../../../api/citas.api';
import { getMascotas } from '../../../api/mascotas.api';
import { getUsuarios } from '../../../api/usuarios.api';
import { useAuthStore } from '../../auth/useAuthStore';

const initialForm = { mascotaId: '', usuarioId: '', fecha: '', motivo: '' };

export interface CitasFiltros {
    estado: '' | Cita['estado'];
    desde: string;
    hasta: string;
}

const filtrosIniciales: CitasFiltros = { estado: '', desde: '', hasta: '' };

export type VistaCitas = 'lista' | 'calendario';

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

    const [filtros, setFiltros] = useState<CitasFiltros>(filtrosIniciales);
    const [vista, setVista] = useState<VistaCitas>('lista');

    const limpiarFiltros = () => setFiltros(filtrosIniciales);

    const citasFiltradas = useMemo(() => {
        if (!citas) return citas;
        return citas.filter((c) => {
            if (filtros.estado && c.estado !== filtros.estado) return false;

            const fechaCita = new Date(c.fecha);
            if (filtros.desde && fechaCita < new Date(filtros.desde)) {
                return false;
            }
            if (filtros.hasta) {
                const hasta = new Date(filtros.hasta);
                hasta.setHours(23, 59, 59, 999);
                if (fechaCita > hasta) return false;
            }
            return true;
        });
    }, [citas, filtros]);

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
        citas: citasFiltradas,
        totalCitas: citas?.length ?? 0,
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
        filtros,
        setFiltros,
        limpiarFiltros,
        vista,
        setVista,
    };
}
