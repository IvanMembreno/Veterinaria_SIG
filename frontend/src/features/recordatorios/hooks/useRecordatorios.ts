import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    createRecordatorio,
    getRecordatorios,
    updateRecordatorio,
    type CreateRecordatorioPayload,
    type Recordatorio,
    type RecordatoriosFiltros,
    type TipoRecordatorio,
} from '../../../api/recordatorios.api';
import { getMascotas } from '../../../api/mascotas.api';
import { construirLinkWhatsapp } from '../whatsapp';

const filtrosIniciales: RecordatoriosFiltros = {
    mascotaId: '',
    estado: undefined,
};

const initialForm: {
    mascotaId: string;
    tipo: TipoRecordatorio;
    fechaProgramada: string;
    nota: string;
} = {
    mascotaId: '',
    tipo: 'VACUNA',
    fechaProgramada: '',
    nota: '',
};

export function useRecordatorios() {
    const queryClient = useQueryClient();

    const [filtros, setFiltros] =
        useState<RecordatoriosFiltros>(filtrosIniciales);

    const filtrosActivos: RecordatoriosFiltros = {
        ...(filtros.mascotaId && { mascotaId: filtros.mascotaId }),
        ...(filtros.estado && { estado: filtros.estado }),
    };

    const { data: recordatorios, isLoading } = useQuery({
        queryKey: ['recordatorios', filtrosActivos],
        queryFn: () => getRecordatorios(filtrosActivos),
    });

    const { data: mascotas } = useQuery({
        queryKey: ['mascotas'],
        queryFn: getMascotas,
    });

    const invalidar = () =>
        queryClient.invalidateQueries({ queryKey: ['recordatorios'] });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form, setForm] = useState(initialForm);

    const createMutation = useMutation({
        mutationFn: createRecordatorio,
        onSuccess: () => {
            invalidar();
            setIsModalOpen(false);
            setForm(initialForm);
        },
    });

    const enviarMutation = useMutation({
        mutationFn: (id: string) =>
            updateRecordatorio(id, {
                estado: 'ENVIADO',
                contactoEnviado: new Date().toISOString(),
            }),
        onSuccess: invalidar,
    });

    const limpiarFiltros = () => setFiltros(filtrosIniciales);

    const abrirNuevo = () => {
        setForm(initialForm);
        setIsModalOpen(true);
    };

    const cerrarModal = () => {
        setIsModalOpen(false);
        setForm(initialForm);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const data: CreateRecordatorioPayload = {
            mascotaId: form.mascotaId,
            tipo: form.tipo,
            fechaProgramada: form.fechaProgramada,
            ...(form.nota && { nota: form.nota }),
        };
        createMutation.mutate(data);
    };

    const enviarRecordatorio = (recordatorio: Recordatorio) => {
        const link = construirLinkWhatsapp(recordatorio);
        if (link) window.open(link, '_blank', 'noopener,noreferrer');
        enviarMutation.mutate(recordatorio.id);
    };

    return {
        recordatorios,
        isLoading,
        mascotas,
        filtros,
        setFiltros,
        limpiarFiltros,
        isModalOpen,
        abrirNuevo,
        cerrarModal,
        form,
        setForm,
        handleSubmit,
        createMutation,
        enviarRecordatorio,
        enviarMutation,
    };
}
