import { useQuery } from '@tanstack/react-query';
import { getResumenDashboard } from '../../../api/dashboard.api';

export interface AlertaStock {
    nombre: string;
    stock: number;
    stockMinimo: number;
}

export interface AlertaVencimiento {
    nombre: string;
    lote?: string | null;
    fechaVenc: string;
    stock: number;
}

export function useDashboard() {
    const { data, isLoading } = useQuery({
        queryKey: ['dashboard'],
        queryFn: getResumenDashboard,
    });

    return {
        ingresosPorServicio: data?.ingresosPorServicio,
        consultasPorVeterinario: data?.consultasPorVeterinario,
        ticketPromedio: data?.ticketPromedio,
        ocupacionAgenda: data?.ocupacionAgenda,
        alertasStockBajo: data?.alertasStockBajo as AlertaStock[] | undefined,
        alertasVencimiento: data?.alertasVencimiento as
            AlertaVencimiento[] | undefined,
        isLoading,
        hasData: Boolean(data),
    };
}
