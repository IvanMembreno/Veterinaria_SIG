import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createConsulta } from '../../../api/consultas.api';
import { getServicios } from '../../../api/servicios.api';
import { getInventario } from '../../../api/inventario.api';

export interface ServicioLinea {
    servicioId: string;
}

export interface InsumoLinea {
    insumoId: string;
    cantidad: string;
}

export function useConsultaForm(citaId: string, onClose: () => void) {
    const queryClient = useQueryClient();
    const { data: servicios } = useQuery({
        queryKey: ['servicios'],
        queryFn: getServicios,
    });
    const { data: inventario } = useQuery({
        queryKey: ['inventario'],
        queryFn: getInventario,
    });

    const [diagnostico, setDiagnostico] = useState('');
    const [tratamiento, setTratamiento] = useState('');
    const [peso, setPeso] = useState('');
    const [temperatura, setTemperatura] = useState('');
    const [serviciosLineas, setServiciosLineas] = useState<ServicioLinea[]>([
        { servicioId: '' },
    ]);
    const [insumosLineas, setInsumosLineas] = useState<InsumoLinea[]>([]);

    const agregarServicioLinea = () =>
        setServiciosLineas((prev) => [...prev, { servicioId: '' }]);

    const actualizarServicioLinea = (index: number, servicioId: string) =>
        setServiciosLineas((prev) =>
            prev.map((linea, i) => (i === index ? { servicioId } : linea)),
        );

    const quitarServicioLinea = (index: number) =>
        setServiciosLineas((prev) => prev.filter((_, i) => i !== index));

    const agregarInsumoLinea = () =>
        setInsumosLineas((prev) => [...prev, { insumoId: '', cantidad: '1' }]);

    const actualizarInsumoLinea = (
        index: number,
        cambios: Partial<InsumoLinea>,
    ) =>
        setInsumosLineas((prev) =>
            prev.map((linea, i) =>
                i === index ? { ...linea, ...cambios } : linea,
            ),
        );

    const quitarInsumoLinea = (index: number) =>
        setInsumosLineas((prev) => prev.filter((_, i) => i !== index));

    const mutation = useMutation({
        mutationFn: createConsulta,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['citas'] });
            queryClient.invalidateQueries({ queryKey: ['inventario'] });
            onClose();
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate({
            citaId,
            diagnostico,
            tratamiento,
            peso: peso ? Number(peso) : undefined,
            temperatura: temperatura ? Number(temperatura) : undefined,
            servicios: serviciosLineas
                .filter((linea) => linea.servicioId)
                .map((linea) => ({ servicioId: linea.servicioId })),
            insumos: insumosLineas
                .filter((linea) => linea.insumoId)
                .map((linea) => ({
                    insumoId: linea.insumoId,
                    cantidad: Number(linea.cantidad) || 1,
                })),
        });
    };

    return {
        servicios,
        inventario,
        diagnostico,
        setDiagnostico,
        tratamiento,
        setTratamiento,
        peso,
        setPeso,
        temperatura,
        setTemperatura,
        serviciosLineas,
        agregarServicioLinea,
        actualizarServicioLinea,
        quitarServicioLinea,
        insumosLineas,
        agregarInsumoLinea,
        actualizarInsumoLinea,
        quitarInsumoLinea,
        handleSubmit,
    };
}
