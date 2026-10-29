import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    getFactura,
    getFacturas,
    pagarFactura,
    type Factura,
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

    // La lista y el detalle ya traen detalles y consulta completos, así que se
    // imprime con los datos en memoria sin volver a pedir la factura.
    const [facturaAImprimir, setFacturaAImprimir] = useState<Factura | null>(
        null,
    );

    useEffect(() => {
        if (!facturaAImprimir) return;
        const limpiar = () => setFacturaAImprimir(null);
        window.addEventListener('afterprint', limpiar);
        // Se espera un frame para que la plantilla ya esté montada al imprimir.
        const frame = requestAnimationFrame(() => window.print());
        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener('afterprint', limpiar);
        };
    }, [facturaAImprimir]);

    const imprimir = (factura: Factura) => setFacturaAImprimir(factura);

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
        facturaAImprimir,
        imprimir,
        isImprimiendo: facturaAImprimir !== null,
    };
}
