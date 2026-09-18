import type { Recordatorio } from '../../api/recordatorios.api';

const TIPO_MOTIVO: Record<Recordatorio['tipo'], string> = {
    VACUNA: 'una vacunación',
    CONTROL: 'un control',
};

export function construirMensajeWhatsapp(recordatorio: Recordatorio): string {
    const mascotaNombre = recordatorio.mascota?.nombre ?? 'tu mascota';
    const clienteNombre = recordatorio.mascota?.cliente?.nombre;
    const fecha = new Date(recordatorio.fechaProgramada).toLocaleDateString();
    const motivo = TIPO_MOTIVO[recordatorio.tipo];

    let mensaje = `Hola${clienteNombre ? ` ${clienteNombre}` : ''}, te escribimos de Veterinaria La Garrita Feliz para recordarte que ${mascotaNombre} tiene programado ${motivo} para el ${fecha}.`;

    if (recordatorio.nota) {
        mensaje += ` Nota: ${recordatorio.nota}`;
    }

    return mensaje;
}

export function construirLinkWhatsapp(
    recordatorio: Recordatorio,
): string | null {
    const telefono = recordatorio.mascota?.cliente?.telefono;
    if (!telefono) return null;

    const telefonoLimpio = telefono.replace(/\D/g, '');
    if (!telefonoLimpio) return null;

    const mensaje = construirMensajeWhatsapp(recordatorio);
    return `https://wa.me/${telefonoLimpio}?text=${encodeURIComponent(mensaje)}`;
}
