import { Link, useParams } from 'react-router-dom';
import { useMascotaDetalle } from './hooks/useMascotaDetalle';
import { HistorialClinico } from './componentes/HistorialClinico';
import { ConsultaForm } from '../consultas/ConsultaForm';
import styles from './styles/mascotas.module.css';

export function MascotaDetallePage() {
    const { id } = useParams<{ id: string }>();
    const {
        mascota,
        isLoading,
        historial,
        citaPendiente,
        citaIdParaConsulta,
        abrirConsulta,
        cerrarConsulta,
    } = useMascotaDetalle(id as string);

    if (isLoading || !mascota) {
        return (
            <div className={styles.loaderContainer}>
                <p>Consultando el expediente de la mascota...</p>
            </div>
        );
    }

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
                {citaPendiente && (
                    <button className={styles.newBtn} onClick={abrirConsulta}>
                        Registrar Nueva Consulta
                    </button>
                )}
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

                <div className={styles.card}>
                    <span className={styles.detalleSeccionTitle}>
                        Historial Clínico
                    </span>
                    <HistorialClinico historial={historial ?? []} />
                </div>
            </div>

            {citaIdParaConsulta && (
                <ConsultaForm
                    citaId={citaIdParaConsulta}
                    onClose={cerrarConsulta}
                />
            )}
        </div>
    );
}
