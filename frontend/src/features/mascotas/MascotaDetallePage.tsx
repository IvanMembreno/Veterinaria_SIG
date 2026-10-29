import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
    filtrarPorRango,
    useMascotaDetalle,
    type RangoFechas,
} from './hooks/useMascotaDetalle';
import { HistorialClinico } from './componentes/HistorialClinico';
import { HistorialImprimible } from './componentes/HistorialImprimible';
import { ConsultaForm } from '../consultas/ConsultaForm';
import { Modal } from '../../components/ui/Modal';
import { useAuthStore } from '../auth/useAuthStore';
import { getRecordatorios } from '../../api/recordatorios.api';
import styles from './styles/mascotas.module.css';

const TIPO_RECORDATORIO_LABEL = { VACUNA: 'Vacuna', CONTROL: 'Control' };

export function MascotaDetallePage() {
    const { id } = useParams<{ id: string }>();
    const queryClient = useQueryClient();
    const {
        mascota,
        isLoading,
        historial,
        citaPendiente,
        citaIdParaConsulta,
        abrirConsulta,
        cerrarConsulta,
        impresion,
        imprimirHistorial,
    } = useMascotaDetalle(id as string);

    // Mismos roles que pueden ver el historial (la ruta ya los restringe).
    const usuario = useAuthStore((s) => s.usuario);
    const puedeImprimir = usuario
        ? ['GERENTE', 'VETERINARIO'].includes(usuario.rol)
        : false;

    const [opcionesImpresionAbiertas, setOpcionesImpresionAbiertas] =
        useState(false);
    const [modoImpresion, setModoImpresion] = useState<'todo' | 'rango'>(
        'todo',
    );
    const [rangoImpresion, setRangoImpresion] = useState<RangoFechas>({
        desde: '',
        hasta: '',
    });

    // Bajo la clave ['recordatorios', ...] para que se refresque junto con la vista de Recordatorios.
    const filtrosRecordatorios = {
        mascotaId: id as string,
        estado: 'PENDIENTE' as const,
    };
    const { data: recordatorios, isLoading: isLoadingRecordatorios } =
        useQuery({
            queryKey: ['recordatorios', filtrosRecordatorios],
            queryFn: () => getRecordatorios(filtrosRecordatorios),
        });

    // Registrar una consulta puede generar recordatorios de vacuna, así que también se refrescan.
    const cerrarConsultaYRefrescar = () => {
        cerrarConsulta();
        queryClient.invalidateQueries({ queryKey: ['recordatorios'] });
    };

    if (isLoading || !mascota) {
        return (
            <div className={styles.loaderContainer}>
                <p>Consultando el expediente de la mascota...</p>
            </div>
        );
    }

    const consultas = historial ?? [];
    const ultimaVisita = consultas.reduce<Date | null>((max, h) => {
        const fecha = new Date(h.cita?.fecha ?? h.createdAt);
        return !max || fecha > max ? fecha : max;
    }, null);
    const proximosRecordatorios = [...(recordatorios ?? [])].sort(
        (a, b) =>
            new Date(a.fechaProgramada).getTime() -
            new Date(b.fechaProgramada).getTime(),
    );

    const rangoSeleccionado =
        modoImpresion === 'rango' ? rangoImpresion : null;
    const rangoIncompleto =
        modoImpresion === 'rango' &&
        (!rangoImpresion.desde || !rangoImpresion.hasta);
    const rangoInvertido =
        modoImpresion === 'rango' &&
        !rangoIncompleto &&
        rangoImpresion.desde > rangoImpresion.hasta;
    const consultasSeleccionadas =
        rangoIncompleto || rangoInvertido
            ? []
            : filtrarPorRango(consultas, rangoSeleccionado);

    const abrirOpcionesImpresion = () => {
        setModoImpresion('todo');
        setRangoImpresion({ desde: '', hasta: '' });
        setOpcionesImpresionAbiertas(true);
    };

    const confirmarImpresion = (e: React.FormEvent) => {
        e.preventDefault();
        setOpcionesImpresionAbiertas(false);
        imprimirHistorial(rangoSeleccionado);
    };

    return (
        <div className={styles.pageWrapper}>
            <Link to="/mascotas" className={styles.backLink}>
                ← Volver a Mascotas
            </Link>

            <header className={styles.pageHeader}>
                <div className={styles.detalleHeaderInfo}>
                    {mascota.imagenUrl ? (
                        <img
                            src={mascota.imagenUrl}
                            alt=""
                            className={styles.detallePhoto}
                        />
                    ) : (
                        <div className={styles.detalleAvatar}>
                            {mascota.nombre.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <div>
                        <span className={styles.subBrand}>
                            VETERINARIA LA GARRITA FELIZ
                        </span>
                        <h1 className={styles.mainTitle}>{mascota.nombre}</h1>
                        <p className={styles.subtitle}>
                            {mascota.especie}
                            {mascota.raza ? ` · ${mascota.raza}` : ''} ·{' '}
                            <span
                                className={
                                    mascota.sexo === 'MACHO'
                                        ? styles.sexMacho
                                        : styles.sexHembra
                                }
                            >
                                {mascota.sexo}
                            </span>
                        </p>
                    </div>
                </div>
                <div className={styles.headerActions}>
                    {puedeImprimir && (
                        <div className={styles.imprimirAccion}>
                            <button
                                className={styles.printHistorialBtn}
                                onClick={abrirOpcionesImpresion}
                                disabled={consultas.length === 0 || !!impresion}
                            >
                                {impresion
                                    ? 'Preparando impresión...'
                                    : 'Imprimir historial'}
                            </button>
                            {consultas.length === 0 && (
                                <span className={styles.imprimirNota}>
                                    Sin consultas para imprimir
                                </span>
                            )}
                        </div>
                    )}
                    {citaPendiente && (
                        <button
                            className={styles.newBtn}
                            onClick={abrirConsulta}
                        >
                            Registrar Nueva Consulta
                        </button>
                    )}
                </div>
            </header>

            <div className={styles.detalleGrid}>
                <div className={styles.card}>
                    <span className={styles.detalleSeccionTitle}>
                        Datos Generales
                    </span>
                    <div className={styles.datosGenerales}>
                        <div className={styles.datoRow}>
                            <span>Propietario</span>
                            <span>
                                {mascota.cliente?.nombre ?? '- Sin asignar -'}
                            </span>
                        </div>
                        <div className={styles.datoRow}>
                            <span>Especie</span>
                            <span>{mascota.especie}</span>
                        </div>
                        <div className={styles.datoRow}>
                            <span>Raza</span>
                            <span>{mascota.raza ?? '-'}</span>
                        </div>
                        <div className={styles.datoRow}>
                            <span>Sexo</span>
                            <span>{mascota.sexo}</span>
                        </div>
                        <div className={styles.datoRow}>
                            <span>Fecha de Nacimiento</span>
                            <span>
                                {mascota.fechaNac
                                    ? new Date(
                                          mascota.fechaNac,
                                      ).toLocaleDateString()
                                    : '-'}
                            </span>
                        </div>
                        <div className={styles.datoRow}>
                            <span>Peso</span>
                            <span>
                                {mascota.peso ? `${mascota.peso} kg` : '-'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className={styles.historialColumna}>
                    <div className={styles.resumenGrid}>
                        <div className={styles.resumenCard}>
                            <span className={styles.resumenLabel}>
                                Total de consultas
                            </span>
                            <span className={styles.resumenValor}>
                                {consultas.length}
                            </span>
                        </div>
                        <div className={styles.resumenCard}>
                            <span className={styles.resumenLabel}>
                                Última visita
                            </span>
                            <span className={styles.resumenValor}>
                                {ultimaVisita
                                    ? ultimaVisita.toLocaleDateString()
                                    : '-'}
                            </span>
                        </div>
                        <div
                            className={`${styles.resumenCard} ${styles.resumenRecordatorios}`}
                        >
                            <span className={styles.resumenLabel}>
                                Próximos recordatorios
                            </span>
                            {isLoadingRecordatorios ? (
                                <span className={styles.resumenVacio}>
                                    Cargando...
                                </span>
                            ) : proximosRecordatorios.length > 0 ? (
                                <ul className={styles.recordatoriosLista}>
                                    {proximosRecordatorios.map((r) => (
                                        <li key={r.id}>
                                            <span
                                                className={`${styles.sexBadge} ${styles.recordatorioTipo}`}
                                            >
                                                {TIPO_RECORDATORIO_LABEL[r.tipo]}
                                            </span>
                                            <span>
                                                {new Date(
                                                    r.fechaProgramada,
                                                ).toLocaleDateString()}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <span className={styles.resumenVacio}>
                                    Sin recordatorios pendientes
                                </span>
                            )}
                        </div>
                    </div>

                    <div className={styles.card}>
                        <span className={styles.detalleSeccionTitle}>
                            Historial Clínico
                        </span>
                        <HistorialClinico historial={consultas} />
                    </div>
                </div>
            </div>

            {citaIdParaConsulta && (
                <ConsultaForm
                    citaId={citaIdParaConsulta}
                    onClose={cerrarConsultaYRefrescar}
                />
            )}

            <Modal
                isOpen={opcionesImpresionAbiertas}
                onClose={() => setOpcionesImpresionAbiertas(false)}
                title="Imprimir historial clínico"
            >
                <form onSubmit={confirmarImpresion} className={styles.formGrid}>
                    <div className={styles.opcionesImpresion}>
                        <label>
                            <input
                                type="radio"
                                name="modo-impresion"
                                checked={modoImpresion === 'todo'}
                                onChange={() => setModoImpresion('todo')}
                            />
                            Todo el historial
                        </label>
                        <label>
                            <input
                                type="radio"
                                name="modo-impresion"
                                checked={modoImpresion === 'rango'}
                                onChange={() => setModoImpresion('rango')}
                            />
                            Solo un rango de fechas
                        </label>
                    </div>

                    {modoImpresion === 'rango' && (
                        <div className={styles.formRow}>
                            <div className={styles.field}>
                                <label htmlFor="imprimir-desde">Desde</label>
                                <input
                                    id="imprimir-desde"
                                    type="date"
                                    value={rangoImpresion.desde}
                                    max={rangoImpresion.hasta || undefined}
                                    onChange={(e) =>
                                        setRangoImpresion({
                                            ...rangoImpresion,
                                            desde: e.target.value,
                                        })
                                    }
                                    required
                                />
                            </div>
                            <div className={styles.field}>
                                <label htmlFor="imprimir-hasta">Hasta</label>
                                <input
                                    id="imprimir-hasta"
                                    type="date"
                                    value={rangoImpresion.hasta}
                                    min={rangoImpresion.desde || undefined}
                                    onChange={(e) =>
                                        setRangoImpresion({
                                            ...rangoImpresion,
                                            hasta: e.target.value,
                                        })
                                    }
                                    required
                                />
                            </div>
                        </div>
                    )}

                    <p className={styles.imprimirNota}>
                        {rangoIncompleto
                            ? 'Elige las dos fechas del rango.'
                            : rangoInvertido
                              ? 'La fecha "desde" no puede ser posterior a "hasta".'
                              : consultasSeleccionadas.length === 0
                                ? 'No hay consultas en ese rango.'
                                : `Se incluirán ${consultasSeleccionadas.length} de ${consultas.length} consultas.`}
                    </p>

                    <button
                        type="submit"
                        className={styles.submitBtn}
                        disabled={consultasSeleccionadas.length === 0}
                    >
                        Imprimir
                    </button>
                </form>
            </Modal>

            {impresion && (
                <HistorialImprimible
                    mascota={mascota}
                    consultas={filtrarPorRango(consultas, impresion.rango)}
                    rango={impresion.rango}
                />
            )}
        </div>
    );
}
