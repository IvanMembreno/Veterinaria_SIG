import { useQuery } from '@tanstack/react-query';
import { getResumenDashboard } from '../../../api/dashboard.api';

export function useDashboard() {
    const {
        data: resumen,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ['dashboard'],
        queryFn: getResumenDashboard,
    });

    return { resumen, isLoading, isError };
}
