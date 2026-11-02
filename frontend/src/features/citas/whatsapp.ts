import type { Cita, TipoAvisoCita } from '../../api/citas.api';
import { DATOS_CLINICA } from '../../utils/datosClinica';
import { leerTelefonoGuardado } from '../../utils/telefono';
import { enlaceWaMe, formatearFechaWhatsapp } from '../recordatorios/whatsapp';

/** Teléfono E.164 sin "+" del dueño de la mascota, o null si falta o es inválido. */
export function telefonoCita(cita: Cita): string | null {
    return leerTelefonoGuardado(cita.mascota?.cliente?.telefono);
}

// Motivo por el que no se puede avisar al cliente, o null si se puede.
export function bloqueoWhatsappCita(cita: Cita): string | null {
    if (!telefonoCita(cita)) return 'El cliente no tiene un teléfono válido';
    if (!cita.mascota?.cliente?.aceptaRecordatorios) {
        return 'El cliente no autoriza recordatorios por WhatsApp';
    }
    return null;
}

// Mantener en línea con las plantillas de WhatsApp del backend (citas.service.ts).
export function construirMensajeCita(cita: Cita, tipo: TipoAvisoCita): string {
    const cliente = cita.mascota?.cliente?.nombre;
    const mascota = cita.mascota?.nombre ?? 'su mascota';
    const fecha = formatearFechaWhatsapp(cita.fecha);
    const saludo = `Hola${cliente ? ` ${cliente}` : ''}, le saludamos de ${DATOS_CLINICA.nombre}.`;

    if (tipo === 'CANCELADA') {
        return `${saludo} Le informamos que su cita fue cancelada: ${mascota} tenía programado: ${cita.motivo}, el ${fecha}. Si desea agendar una nueva cita, comuníquese con nosotros.`;
    }
    const intro =
        tipo === 'REPROGRAMADA'
            ? 'Le informamos que su cita fue reprogramada:'
            : 'Le recordamos que';
    return `${saludo} ${intro} ${mascota} tiene programado: ${cita.motivo}, el ${fecha}. Si necesita reprogramar, comuníquese con nosotros.`;
}

export function construirLinkCita(
    cita: Cita,
    tipo: TipoAvisoCita,
): string | null {
    const telefono = telefonoCita(cita);
    if (!telefono) return null;
    return enlaceWaMe(telefono, construirMensajeCita(cita, tipo));
}
