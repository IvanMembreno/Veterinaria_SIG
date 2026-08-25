import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getInventario,
    createInsumo,
    registrarEntrada,
} from '../../../api/inventario.api';
import { useAuthStore } from '../../auth/useAuthStore';

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

    const [form, setForm] = useState({
        nombre: '',
        lote: '',
        fechaVenc: '',
        stock: '',
        stockMinimo: '5',
        precioUnit: '',
    });
    const [entradas, setEntradas] = useState<Record<string, string>>({});

    const createMutation = useMutation({
        mutationFn: createInsumo,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inventario'] });
            setForm({
                nombre: '',
                lote: '',
                fechaVenc: '',
                stock: '',
                stockMinimo: '5',
                precioUnit: '',
            });
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
        form,
        setForm,
        entradas,
        setEntradas,
        entradaMutation,
        handleSubmit,
    };
}
