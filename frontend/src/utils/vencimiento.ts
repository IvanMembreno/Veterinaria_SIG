const ZONA_HORARIA = 'America/El_Salvador';

// Fecha de hoy (AAAA-MM-DD) en El Salvador, igual que la validación del backend.
const diaDeHoy = () => {
    const partes = new Intl.DateTimeFormat('en-US', {
        timeZone: ZONA_HORARIA,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).formatToParts(new Date());
    const parte = (tipo: string) => partes.find((p) => p.type === tipo)?.value;
    return `${parte('year')}-${parte('month')}-${parte('day')}`;
};

// fechaVenc llega como medianoche UTC: sus primeros 10 caracteres son el día de vencimiento,
// y el insumo sigue siendo válido durante todo ese día.
export const estaVencido = (fechaVenc?: string | null) =>
    !!fechaVenc && fechaVenc.slice(0, 10) < diaDeHoy();
