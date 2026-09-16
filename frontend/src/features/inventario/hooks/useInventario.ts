import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getInventario,
    createInsumo,
    registrarEntrada,
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

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form, setForm] = useState(initialForm);
    const [entradas, setEntradas] = useState<Record<string, string>>({});

    const createMutation = useMutation({
        mutationFn: createInsumo,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inventario'] });
            setForm(initialForm);
            setIsModalOpen(false);
        },
    });

    const entradaMutation = useMutation({
        mutationFn: ({ id, cantidad }: { id: string; cantidad: number }) =>
            registrarEntrada(id, cantidad),
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: ['inventario'] }),
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
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
        isModalOpen,
        setIsModalOpen,
        form,
        setForm,
        entradas,
        setEntradas,
        entradaMutation,
        handleSubmit,
    };
}
