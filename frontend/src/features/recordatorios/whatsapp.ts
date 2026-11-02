import type { Recordatorio } from '../../api/recordatorios.api';
import { DATOS_CLINICA } from '../../utils/datosClinica';
import { leerTelefonoGuardado } from '../../utils/telefono';

// Mantener en línea con la plantilla de WhatsApp del backend (recordatorios.service.ts).
const TIPO_MOTIVO: Record<Recordatorio['tipo'], string> = {
    VACUNA: 'Vacunación',
    CONTROL: 'Control',
};

/**
 * "dd/MM/yyyy a las h:mm AM" en hora de El Salvador. Las fechas guardadas sin hora
 * (medianoche UTC, como las del formulario) se muestran solo como "dd/MM/yyyy".
 */
export function formatearFechaWhatsapp(iso: string): string {
    const fecha = new Date(iso);
    const soloFecha =
        fecha.getUTCHours() === 0 &&
        fecha.getUTCMinutes() === 0 &&
        fecha.getUTCSeconds() === 0;
    const p = Object.fromEntries(
        new Intl.DateTimeFormat('en-US', {
            timeZone: soloFecha ? 'UTC' : 'America/El_Salvador',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        })
            .formatToParts(fecha)
            .map((parte) => [parte.type, parte.value]),
    );
    const dia = `${p.day}/${p.month}/${p.year}`;
    return soloFecha
        ? dia
        : `${dia} a las ${p.hour}:${p.minute} ${p.dayPeriod}`;
}

export function construirMensajeWhatsapp(recordatorio: Recordatorio): string {
    const mascotaNombre = recordatorio.mascota?.nombre ?? 'tu mascota';
    const clienteNombre = recordatorio.mascota?.cliente?.nombre;
    const fecha = formatearFechaWhatsapp(recordatorio.fechaProgramada);
    const motivo = TIPO_MOTIVO[recordatorio.tipo];

    let mensaje = `Hola${clienteNombre ? ` ${clienteNombre}` : ''}, te escribimos de ${DATOS_CLINICA.nombre} para recordarte que ${mascotaNombre} tiene programado el servicio "${motivo}" para el ${fecha}.`;

    if (recordatorio.nota) {
        mensaje += ` Nota: ${recordatorio.nota}`;
    }

    return mensaje;
}

/** Teléfono E.164 sin "+" (p. ej. "50370010001") o null si falta o es inválido. */
export function telefonoWhatsapp(recordatorio: Recordatorio): string | null {
    return leerTelefonoGuardado(recordatorio.mascota?.cliente?.telefono);
}

/** Enlace wa.me con el mensaje prellenado; `telefono` en E.164 sin "+". */
export function enlaceWaMe(telefono: string, mensaje: string): string {
    return `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
}

export function construirLinkWhatsapp(
    recordatorio: Recordatorio,
): string | null {
    const telefono = telefonoWhatsapp(recordatorio);
    if (!telefono) return null;

    return enlaceWaMe(telefono, construirMensajeWhatsapp(recordatorio));
}
