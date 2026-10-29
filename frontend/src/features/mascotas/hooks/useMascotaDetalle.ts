import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
    getHistorialMascota,
    getMascota,
    type HistorialConsulta,
} from '../../../api/mascotas.api';

// Rango de fechas locales "YYYY-MM-DD" (ambos extremos incluidos).
export interface RangoFechas {
    desde: string;
    hasta: string;
}

export const fechaDeConsulta = (h: HistorialConsulta) =>
    h.cita?.fecha ?? h.createdAt;

const fechaLocal = (valor: string) => {
    const d = new Date(valor);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export function filtrarPorRango(
    consultas: HistorialConsulta[],
    rango: RangoFechas | null,
) {
    if (!rango) return consultas;
    return consultas.filter((h) => {
        const dia = fechaLocal(fechaDeConsulta(h));
        return dia >= rango.desde && dia <= rango.hasta;
    });
}

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

    // Impresión del historial: igual que la factura, se monta la plantilla, se llama a
    // window.print() y se desmonta al cerrar el diálogo de impresión.
    const [impresion, setImpresion] = useState<{
        rango: RangoFechas | null;
    } | null>(null);

    useEffect(() => {
        if (!impresion) return;
        const limpiar = () => setImpresion(null);
        window.addEventListener('afterprint', limpiar);
        const frame = requestAnimationFrame(() => window.print());
        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener('afterprint', limpiar);
        };
    }, [impresion]);

    const imprimirHistorial = (rango: RangoFechas | null) =>
        setImpresion({ rango });

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
        impresion,
        imprimirHistorial,
    };
}
