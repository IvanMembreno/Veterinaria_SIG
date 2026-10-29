import type { Cita } from '../../api/citas.api';

export const ESTADO_LABEL: Record<Cita['estado'], string> = {
    PROGRAMADA: 'Programada',
    CONFIRMADA: 'Confirmada',
    ATENDIDA: 'Atendida',
    CANCELADA: 'Cancelada',
    NO_ASISTIO: 'No Asistió',
};

export function estadoBadgeClass(estado: Cita['estado']): string {
    switch (estado) {
        case 'PROGRAMADA':
            return 'statusProgramada';
        case 'CONFIRMADA':
            return 'statusConfirmada';
        case 'ATENDIDA':
            return 'statusAtendida';
        case 'CANCELADA':
            return 'statusCancelada';
        case 'NO_ASISTIO':
            return 'statusNoAsistio';
    }
}
