import { useState } from 'react';
import type { Cita } from '../../../api/citas.api';
import { ESTADO_LABEL, estadoBadgeClass } from '../estado';
import styles from '../styles/citas.module.css';

interface CalendarioCitasProps {
    citas: Cita[];
    onAtender: (id: string) => void;
    onCancelar: (id: string) => void;
}

const DIA_LABEL = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

function inicioSemana(fecha: Date): Date {
    const dia = fecha.getDay();
    const diff = dia === 0 ? -6 : 1 - dia;
    const d = new Date(fecha);
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
}

function mismoDia(a: Date, b: Date): boolean {
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    );
}

export function CalendarioCitas({
    citas,
    onAtender,
    onCancelar,
}: CalendarioCitasProps) {
    const [semanaBase, setSemanaBase] = useState(() =>
        inicioSemana(new Date()),
    );

    const dias = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(semanaBase);
        d.setDate(d.getDate() + i);
        return d;
    });

    const hoy = new Date();

    const irSemanaAnterior = () =>
        setSemanaBase((prev) => {
            const d = new Date(prev);
            d.setDate(d.getDate() - 7);
            return d;
        });

    const irSemanaSiguiente = () =>
        setSemanaBase((prev) => {
            const d = new Date(prev);
            d.setDate(d.getDate() + 7);
            return d;
        });

    const irHoy = () => setSemanaBase(inicioSemana(new Date()));

    const rangoLabel = `${dias[0].toLocaleDateString('es', {
        day: 'numeric',
        month: 'short',
    })} – ${dias[6].toLocaleDateString('es', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    })}`;

    return (
        <div className={styles.calendarWrapper}>
            <div className={styles.calendarNav}>
                <button
                    type="button"
                    className={styles.navBtn}
                    onClick={irSemanaAnterior}
                    aria-label="Semana anterior"
                >
                    ‹
                </button>
                <span className={styles.calendarRango}>{rangoLabel}</span>
                <button
                    type="button"
                    className={styles.navBtn}
                    onClick={irSemanaSiguiente}
                    aria-label="Semana siguiente"
                >
                    ›
                </button>
                <button
                    type="button"
                    className={styles.todayBtn}
                    onClick={irHoy}
                >
                    Hoy
                </button>
            </div>

            <div className={styles.weekGrid}>
                {dias.map((dia) => {
                    const citasDelDia = citas
                        .filter((c) => mismoDia(new Date(c.fecha), dia))
                        .sort(
                            (a, b) =>
                                new Date(a.fecha).getTime() -
                                new Date(b.fecha).getTime(),
                        );
                    const esHoy = mismoDia(dia, hoy);

                    return (
                        <div
                            key={dia.toISOString()}
                            className={styles.dayColumn}
                        >
                            <div
                                className={`${styles.dayHeader} ${esHoy ? styles.dayHeaderToday : ''}`}
                            >
                                <span className={styles.dayName}>
                                    {DIA_LABEL[dia.getDay()]}
                                </span>
                                <span className={styles.dayNumber}>
                                    {dia.getDate()}
                                </span>
                            </div>

                            <div className={styles.dayBody}>
                                {citasDelDia.length === 0 ? (
                                    <p className={styles.dayEmpty}>Sin citas</p>
                                ) : (
                                    citasDelDia.map((c) => {
                                        const isScheduled =
                                            c.estado === 'PROGRAMADA' ||
                                            c.estado === 'CONFIRMADA';
                                        return (
                                            <div
                                                key={c.id}
                                                className={styles.calendarCard}
                                            >
                                                <div
                                                    className={
                                                        styles.calendarCardHeader
                                                    }
                                                >
                                                    <span
                                                        className={
                                                            styles.calendarHora
                                                        }
                                                    >
                                                        {new Date(
                                                            c.fecha,
                                                        ).toLocaleTimeString(
                                                            [],
                                                            {
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                            },
                                                        )}
                                                    </span>
                                                    <span
                                                        className={`${styles.statusBadge} ${styles[estadoBadgeClass(c.estado)]}`}
                                                    >
                                                        {ESTADO_LABEL[c.estado]}
                                                    </span>
                                                </div>
                                                <span
                                                    className={
                                                        styles.calendarPet
                                                    }
                                                >
                                                    {c.mascota?.nombre ?? '-'}
                                                </span>
                                                <span
                                                    className={
                                                        styles.calendarVet
                                                    }
                                                >
                                                    {c.usuario?.nombre ?? '-'}
                                                </span>
                                                {isScheduled && (
                                                    <div
                                                        className={
                                                            styles.calendarActions
                                                        }
                                                    >
                                                        <button
                                                            type="button"
                                                            className={
                                                                styles.attendBtnSmall
                                                            }
                                                            onClick={() =>
                                                                onAtender(c.id)
                                                            }
                                                        >
                                                            Atender
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className={
                                                                styles.cancelBtnSmall
                                                            }
                                                            onClick={() =>
                                                                onCancelar(c.id)
                                                            }
                                                        >
                                                            Cancelar
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
