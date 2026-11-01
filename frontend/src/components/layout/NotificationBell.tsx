import { useEffect, useId, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/useAuthStore';
import { useNotificaciones } from '../../features/notificaciones/hooks/useNotificaciones';
import type { Notificacion, Severidad } from '../../api/notificaciones.api';
import styles from './styles/notificaciones.module.css';

const SECCIONES: { severidad: Severidad; titulo: string }[] = [
    { severidad: 'alta', titulo: 'Urgentes' },
    { severidad: 'media', titulo: 'Importantes' },
    { severidad: 'info', titulo: 'Informativas' },
];

const formatearFecha = (iso: string) => {
    const fecha = new Date(iso);
    const esHoy = fecha.toDateString() === new Date().toDateString();
    return esHoy
        ? `Hoy, ${fecha.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}`
        : fecha.toLocaleDateString('es', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
          });
};

export function NotificationBell() {
    const usuario = useAuthStore((s) => s.usuario);
    if (!usuario) return null;
    // La key reinicia el estado de "leídas" si cambia el usuario.
    return <Campana key={usuario.id} usuarioId={usuario.id} />;
}

function Campana({ usuarioId }: { usuarioId: string }) {
    const navigate = useNavigate();
    const {
        notificaciones,
        isLoading,
        isError,
        noLeidas,
        hayUrgentes,
        esLeida,
        marcarLeida,
        marcarTodasLeidas,
    } = useNotificaciones(usuarioId);

    const [abierto, setAbierto] = useState(false);
    const contenedorRef = useRef<HTMLDivElement>(null);
    const botonRef = useRef<HTMLButtonElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const panelId = useId();

    useEffect(() => {
        if (!abierto) return;
        panelRef.current?.focus();

        const alHacerClicFuera = (e: MouseEvent) => {
            if (!contenedorRef.current?.contains(e.target as Node)) {
                setAbierto(false);
            }
        };
        const alPresionarTecla = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setAbierto(false);
                botonRef.current?.focus();
            }
        };
        document.addEventListener('mousedown', alHacerClicFuera);
        document.addEventListener('keydown', alPresionarTecla);
        return () => {
            document.removeEventListener('mousedown', alHacerClicFuera);
            document.removeEventListener('keydown', alPresionarTecla);
        };
    }, [abierto]);

    const abrirNotificacion = (n: Notificacion) => {
        marcarLeida(n);
        setAbierto(false);
        navigate(n.ruta);
    };

    const cantidad = noLeidas.length;

    return (
        <div className={styles.contenedor} ref={contenedorRef}>
            <button
                ref={botonRef}
                type="button"
                className={styles.campanaBtn}
                aria-label={
                    cantidad > 0
                        ? `Notificaciones, ${cantidad} sin leer`
                        : 'Notificaciones'
                }
                aria-haspopup="dialog"
                aria-expanded={abierto}
                aria-controls={panelId}
                onClick={() => setAbierto(!abierto)}
            >
                <svg
                    viewBox="0 0 24 24"
                    width="22"
                    height="22"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                >
                    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                {cantidad > 0 && (
                    <span
                        className={`${styles.insignia} ${hayUrgentes ? styles.insigniaUrgente : ''}`}
                        aria-hidden="true"
                    >
                        {cantidad > 9 ? '9+' : cantidad}
                    </span>
                )}
            </button>

            {abierto && (
                <div
                    ref={panelRef}
                    id={panelId}
                    className={styles.panel}
                    role="dialog"
                    aria-label="Notificaciones"
                    tabIndex={-1}
                >
                    <div className={styles.panelHeader}>
                        <h2 className={styles.panelTitulo}>Notificaciones</h2>
                        <button
                            type="button"
                            className={styles.marcarTodasBtn}
                            onClick={marcarTodasLeidas}
                            disabled={cantidad === 0}
                        >
                            Marcar todas como leídas
                        </button>
                    </div>

                    {isLoading ? (
                        <p className={styles.estado}>Cargando...</p>
                    ) : isError ? (
                        <p className={styles.estado}>
                            No se pudieron cargar las notificaciones.
                        </p>
                    ) : notificaciones.length === 0 ? (
                        <p className={styles.estado}>
                            No tienes notificaciones
                        </p>
                    ) : (
                        SECCIONES.map(({ severidad, titulo }) => {
                            const lista = notificaciones.filter(
                                (n) => n.severidad === severidad,
                            );
                            if (lista.length === 0) return null;
                            return (
                                <section
                                    key={severidad}
                                    className={styles.seccion}
                                    aria-label={titulo}
                                >
                                    <h3 className={styles.seccionTitulo}>
                                        {titulo}
                                    </h3>
                                    <ul className={styles.lista}>
                                        {lista.map((n) => (
                                            <ItemNotificacion
                                                key={n.id}
                                                notificacion={n}
                                                leida={esLeida(n)}
                                                onAbrir={abrirNotificacion}
                                            />
                                        ))}
                                    </ul>
                                </section>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
}

interface ItemNotificacionProps {
    notificacion: Notificacion;
    leida: boolean;
    onAbrir: (n: Notificacion) => void;
}

function ItemNotificacion({
    notificacion: n,
    leida,
    onAbrir,
}: ItemNotificacionProps) {
    return (
        <li>
            <button
                type="button"
                className={`${styles.item} ${leida ? styles.itemLeido : ''}`}
                onClick={() => onAbrir(n)}
            >
                <span
                    className={`${styles.punto} ${styles[`punto-${n.severidad}`]}`}
                    aria-hidden="true"
                />
                <span className={styles.itemTexto}>
                    <span className={styles.itemTitulo}>
                        {n.titulo}
                        {!leida && (
                            <span className={styles.srOnly}> (sin leer)</span>
                        )}
                    </span>
                    <span className={styles.itemDetalle}>{n.detalle}</span>
                    <span className={styles.itemFecha}>
                        {formatearFecha(n.fecha)}
                    </span>
                </span>
            </button>
        </li>
    );
}
