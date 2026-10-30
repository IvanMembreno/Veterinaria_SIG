import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getInventario,
    createInsumo,
    updateInsumo,
    registrarEntrada,
    type Insumo,
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
    const [imagen, setImagen] = useState<File | null>(null);

    const cerrarModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setForm(initialForm);
        setImagen(null);
    };

    const createMutation = useMutation({
        mutationFn: createInsumo,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inventario'] });
            cerrarModal();
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: FormData }) =>
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
        setImagen(null);
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
        setImagen(null);
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const data = new FormData();
        data.append('nombre', form.nombre);
        // Lote y vencimiento se envían aunque estén vacíos para poder limpiarlos al editar.
        data.append('lote', form.lote);
        data.append('fechaVenc', form.fechaVenc);
        // El stock solo se envía al crear: luego cambia por entradas, consultas o ventas.
        if (!editingId) data.append('stock', form.stock);
        if (form.stockMinimo) data.append('stockMinimo', form.stockMinimo);
        data.append('precioUnit', form.precioUnit);
        if (imagen) data.append('imagen', imagen);

        if (editingId) {
            updateMutation.mutate({ id: editingId, data });
        } else {
            createMutation.mutate(data);
        }
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
        imagen,
        setImagen,
        entradaMutation,
        handleSubmit,
        isSaving: createMutation.isPending || updateMutation.isPending,
        isError: createMutation.isError || updateMutation.isError,
        error: createMutation.error ?? updateMutation.error,
    };
}
