import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    getFactura,
    getFacturas,
    pagarFactura,
    type FacturasFiltros,
} from '../../../api/facturas.api';
import { getClientes } from '../../../api/clientes.api';

const filtrosIniciales: FacturasFiltros = {
    desde: '',
    hasta: '',
    clienteId: '',
    estado: undefined,
};

export function useFacturas() {
    const queryClient = useQueryClient();

    const [filtros, setFiltros] = useState<FacturasFiltros>(filtrosIniciales);

    const filtrosActivos: FacturasFiltros = {
        ...(filtros.desde && { desde: filtros.desde }),
        ...(filtros.hasta && { hasta: filtros.hasta }),
        ...(filtros.clienteId && { clienteId: filtros.clienteId }),
        ...(filtros.estado && { estado: filtros.estado }),
    };

    const { data: facturas, isLoading } = useQuery({
        queryKey: ['facturas', filtrosActivos],
        queryFn: () => getFacturas(filtrosActivos),
    });

    const { data: clientes } = useQuery({
        queryKey: ['clientes'],
        queryFn: getClientes,
    });

    const [facturaSeleccionadaId, setFacturaSeleccionadaId] = useState<
        string | null
    >(null);
    const { data: facturaSeleccionada, isLoading: isLoadingDetalle } = useQuery(
        {
            queryKey: ['factura', facturaSeleccionadaId],
            queryFn: () => getFactura(facturaSeleccionadaId as string),
            enabled: !!facturaSeleccionadaId,
        },
    );

    const [facturaAPagarId, setFacturaAPagarId] = useState<string | null>(null);
    const [metodoPago, setMetodoPago] = useState('efectivo');

    const pagarMutation = useMutation({
        mutationFn: ({ id, metodoPago }: { id: string; metodoPago: string }) =>
            pagarFactura(id, metodoPago),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['facturas'] });
            queryClient.invalidateQueries({
                queryKey: ['factura', facturaAPagarId],
            });
            cerrarPago();
        },
    });

    const limpiarFiltros = () => setFiltros(filtrosIniciales);

    const verDetalle = (id: string) => setFacturaSeleccionadaId(id);
    const cerrarDetalle = () => setFacturaSeleccionadaId(null);

    const abrirPago = (id: string) => {
        setMetodoPago('efectivo');
        setFacturaAPagarId(id);
    };
    const cerrarPago = () => {
        setFacturaAPagarId(null);
        pagarMutation.reset();
    };

    const confirmarPago = () => {
        if (!facturaAPagarId) return;
        pagarMutation.mutate({ id: facturaAPagarId, metodoPago });
    };

    return {
        facturas,
        isLoading,
        clientes,
        filtros,
        setFiltros,
        limpiarFiltros,
        facturaSeleccionada,
        isLoadingDetalle,
        verDetalle,
        cerrarDetalle,
        facturaAPagarId,
        metodoPago,
        setMetodoPago,
        abrirPago,
        cerrarPago,
        confirmarPago,
        pagarMutation,
    };
}
