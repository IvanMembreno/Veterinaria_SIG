import { BadRequestException } from '@nestjs/common';

const ZONA_HORARIA = 'America/El_Salvador';

// fechaVenc se guarda sin hora (medianoche UTC), así que su día de calendario es el de UTC.
const diaDeVencimiento = (fechaVenc: Date) =>
    fechaVenc.toISOString().slice(0, 10);

// Fecha de hoy (AAAA-MM-DD) en El Salvador, sin importar la zona horaria del servidor.
const diaDeHoy = (ahora: Date) => {
    const partes = new Intl.DateTimeFormat('en-US', {
        timeZone: ZONA_HORARIA,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).formatToParts(ahora);
    const parte = (tipo: string) => partes.find((p) => p.type === tipo)?.value;
    return `${parte('year')}-${parte('month')}-${parte('day')}`;
};

// El insumo sigue siendo válido durante todo el día de su fecha de vencimiento.
export const estaVencido = (fechaVenc: Date | null, ahora = new Date()) =>
    fechaVenc !== null && diaDeVencimiento(fechaVenc) < diaDeHoy(ahora);

export function validarInsumoNoVencido(insumo: {
    nombre: string;
    fechaVenc: Date | null;
}) {
    if (!insumo.fechaVenc || !estaVencido(insumo.fechaVenc)) return;
    const [anio, mes, dia] = diaDeVencimiento(insumo.fechaVenc).split('-');
    throw new BadRequestException(
        `El insumo ${insumo.nombre} está vencido (venció el ${dia}/${mes}/${anio})`,
    );
}
