import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getHistorialMascota, getMascota } from '../../../api/mascotas.api';

export function useMascotaDetalle(id: string) {
    const queryClient = useQueryClient();

    const { data: mascota, isLoading: isLoadingMascota } = useQuery({
        queryKey: ['mascota', id],
        queryFn: () => getMascota(id),
    });

    const { data: historial, isLoading: isLoadingHistorial } = useQuery({
        queryKey: ['historial-mascota', id],
        queryFn: () => getHistorialMascota(id),
    });

    const [citaIdParaConsulta, setCitaIdParaConsulta] = useState<string | null>(
        null,
    );

    const citaPendiente = mascota?.citas
        ?.filter((c) => c.estado === 'PROGRAMADA' || c.estado === 'CONFIRMADA')
        .sort(
            (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime(),
        )[0];

    const abrirConsulta = () => {
        if (citaPendiente) setCitaIdParaConsulta(citaPendiente.id);
    };

    const cerrarConsulta = () => {
        setCitaIdParaConsulta(null);
        queryClient.invalidateQueries({ queryKey: ['mascota', id] });
        queryClient.invalidateQueries({ queryKey: ['historial-mascota', id] });
    };

    return {
        mascota,
        isLoading: isLoadingMascota || isLoadingHistorial,
        historial,
        citaPendiente,
        citaIdParaConsulta,
        abrirConsulta,
        cerrarConsulta,
    };
}
