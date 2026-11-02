import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    createRecordatorio,
    enviarRecordatorioWhatsapp,
    getEstadoWhatsapp,
    getRecordatorios,
    updateRecordatorio,
    type CreateRecordatorioPayload,
    type Recordatorio,
    type RecordatoriosFiltros,
    type TipoRecordatorio,
    type UpdateRecordatorioPayload,
} from '../../../api/recordatorios.api';
import { getMascotas } from '../../../api/mascotas.api';
import { construirLinkWhatsapp } from '../whatsapp';
import { getErrorMessage } from '../../../utils/getErrorMessage';

const SUGERENCIA_RESPALDO =
    'Puedes usar el botón "Abrir WhatsApp" como respaldo.';

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

    const { data: estadoWhatsapp } = useQuery({
        queryKey: ['whatsapp-estado'],
        queryFn: getEstadoWhatsapp,
        staleTime: 5 * 60 * 1000,
    });

    const invalidar = () =>
        queryClient.invalidateQueries({ queryKey: ['recordatorios'] });

    const [aviso, setAviso] = useState<{
        tipo: 'exito' | 'error';
        texto: string;
    } | null>(null);

    useEffect(() => {
        if (!aviso) return;
        const timer = setTimeout(() => setAviso(null), 6000);
        return () => clearTimeout(timer);
    }, [aviso]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState(initialForm);

    const cerrarModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setForm(initialForm);
    };

    const createMutation = useMutation({
        mutationFn: createRecordatorio,
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
            data: UpdateRecordatorioPayload;
        }) => updateRecordatorio(id, data),
        onSuccess: () => {
            invalidar();
            cerrarModal();
        },
    });

    const enviarMutation = useMutation({
        mutationFn: (id: string) =>
            updateRecordatorio(id, {
                estado: 'ENVIADO',
                contactoEnviado: new Date().toISOString(),
            }),
        onSuccess: invalidar,
        onError: () =>
            setAviso({
                tipo: 'error',
                texto: 'No se pudo actualizar el estado del recordatorio tras abrir WhatsApp. Intenta de nuevo.',
            }),
    });

    const enviarApiMutation = useMutation({
        mutationFn: enviarRecordatorioWhatsapp,
        onSuccess: () => {
            invalidar();
            setAviso({
                tipo: 'exito',
                texto: 'Recordatorio enviado por WhatsApp.',
            });
        },
        onError: (error) =>
            setAviso({
                tipo: 'error',
                texto: `${getErrorMessage(error, 'No se pudo enviar el recordatorio por WhatsApp.')} ${SUGERENCIA_RESPALDO}`,
            }),
    });

    const limpiarFiltros = () => setFiltros(filtrosIniciales);

    const abrirNuevo = () => {
        setEditingId(null);
        setForm(initialForm);
        setIsModalOpen(true);
    };

    const abrirEdicion = (recordatorio: Recordatorio) => {
        setEditingId(recordatorio.id);
        setForm({
            mascotaId: recordatorio.mascotaId,
            tipo: recordatorio.tipo,
            fechaProgramada: recordatorio.fechaProgramada.slice(0, 10),
            nota: recordatorio.nota ?? '',
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingId) {
            updateMutation.mutate({
                id: editingId,
                data: {
                    tipo: form.tipo,
                    fechaProgramada: form.fechaProgramada,
                    nota: form.nota,
                },
            });
            return;
        }
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
        editingId,
        abrirNuevo,
        abrirEdicion,
        cerrarModal,
        form,
        setForm,
        handleSubmit,
        isSaving: createMutation.isPending || updateMutation.isPending,
        isError: createMutation.isError || updateMutation.isError,
        error: createMutation.error ?? updateMutation.error,
        enviarRecordatorio,
        apiWhatsappHabilitada: estadoWhatsapp?.apiHabilitada ?? false,
        enviarApiMutation,
        aviso,
    };
}
