import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    getNotificaciones,
    type Notificacion,
} from '../../../api/notificaciones.api';

// Fecha local en formato AAAA-MM-DD.
const fechaDeHoy = () => {
    const hoy = new Date();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');
    return `${hoy.getFullYear()}-${mes}-${dia}`;
};

const leerLeidas = (clave: string): Set<string> => {
    try {
        const guardado = localStorage.getItem(clave);
        const lista: unknown = guardado ? JSON.parse(guardado) : [];
        return new Set(Array.isArray(lista) ? lista.map(String) : []);
    } catch {
        return new Set();
    }
};

const guardarLeidas = (clave: string, leidas: Set<string>) => {
    try {
        localStorage.setItem(clave, JSON.stringify([...leidas]));
    } catch {
        // Sin almacenamiento disponible las notificaciones solo quedan leídas en esta sesión.
    }
};

// Consulta compartida por la campana y el menú lateral (misma queryKey, misma caché).
// Solo un componente debe activar `polling` para no duplicar las peticiones periódicas.
export function useNotificacionesQuery(
    usuarioId: string | undefined,
    { polling = false } = {},
) {
    return useQuery({
        queryKey: ['notificaciones', usuarioId],
        queryFn: getNotificaciones,
        enabled: !!usuarioId,
        refetchInterval: polling ? 60_000 : false,
        refetchOnWindowFocus: polling,
    });
}

export function useNotificaciones(usuarioId: string) {
    const {
        data: notificaciones = [],
        isLoading,
        isError,
    } = useNotificacionesQuery(usuarioId, { polling: true });

    const claveStorage = `notificaciones-leidas:${usuarioId}`;
    const [leidas, setLeidas] = useState(() => leerLeidas(claveStorage));

    // 'diaria': la clave incluye el día, así una alerta vigente vuelve a aparecer mañana.
    // 'unica': la clave es solo el id, una vez leída no reaparece.
    const hoy = fechaDeHoy();
    const claveLeida = (n: Notificacion) =>
        n.lectura === 'unica' ? n.id : `${n.id}|${hoy}`;
    const esLeida = (n: Notificacion) => leidas.has(claveLeida(n));

    const marcarLeidas = (lista: Notificacion[]) => {
        // Para no acumular marcas se descartan las diarias de días anteriores y las
        // únicas de notificaciones que el servidor ya no devuelve.
        const idsVigentes = new Set(notificaciones.map((n) => n.id));
        const siguiente = new Set(
            [...leidas].filter((k) =>
                k.includes('|') ? k.endsWith(`|${hoy}`) : idsVigentes.has(k),
            ),
        );
        lista.forEach((n) => siguiente.add(claveLeida(n)));
        setLeidas(siguiente);
        guardarLeidas(claveStorage, siguiente);
    };

    const noLeidas = notificaciones.filter((n) => !esLeida(n));

    return {
        notificaciones,
        isLoading,
        isError,
        noLeidas,
        hayUrgentes: noLeidas.some((n) => n.severidad === 'alta'),
        esLeida,
        marcarLeida: (n: Notificacion) => marcarLeidas([n]),
        marcarTodasLeidas: () => marcarLeidas(notificaciones),
    };
}
