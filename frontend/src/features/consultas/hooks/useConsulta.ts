import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createConsulta } from '../../../api/consultas.api';
import { getServicios } from '../../../api/servicios.api';
import { getInventario } from '../../../api/inventario.api';

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
    const [servicioId, setServicioId] = useState('');
    const [insumoId, setInsumoId] = useState('');
    const [cantidadInsumo, setCantidadInsumo] = useState('1');

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
            servicios: servicioId ? [{ servicioId, cantidad: 1 }] : [],
            insumos: insumoId
                ? [{ insumoId, quantity: Number(cantidadInsumo) }]
                : [],
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
        servicioId,
        setServicioId,
        insumoId,
        setInsumoId,
        cantidadInsumo,
        setCantidadInsumo,
        handleSubmit,
    };
}
