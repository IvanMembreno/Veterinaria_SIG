import { createPortal } from 'react-dom';
import type {
    HistorialConsulta,
    MascotaDetalle,
} from '../../../api/mascotas.api';
import { DATOS_CLINICA } from '../../../utils/datosClinica';
import { fechaDeConsulta, type RangoFechas } from '../hooks/useMascotaDetalle';
// Mismos estilos de impresión que la factura (contenedor, encabezado, datos y pie).
import printStyles from '../../facturas/styles/facturas.module.css';
import styles from '../styles/mascotas.module.css';

// El backend devuelve el cliente completo; aquí solo se necesita además el teléfono.
type MascotaConPropietario = MascotaDetalle & {
    cliente?: { nombre: string; telefono?: string };
};

interface HistorialImprimibleProps {
    mascota: MascotaConPropietario;
    consultas: HistorialConsulta[];
    rango: RangoFechas | null;
}

// Las fechas del rango vienen como "YYYY-MM-DD" (locales); se muestran sin cambiar de día.
const fechaRango = (valor: string) => {
    const [anio, mes, dia] = valor.split('-').map(Number);
    return new Date(anio, mes - 1, dia).toLocaleDateString('es', {
        dateStyle: 'long',
    });
};

// Se monta directamente en <body>; solo es visible al imprimir (ver @media print en facturas.module.css).
export function HistorialImprimible({
    mascota,
    consultas,
    rango,
}: HistorialImprimibleProps) {
    const ordenadas = [...consultas].sort(
        (a, b) =>
            new Date(fechaDeConsulta(b)).getTime() -
            new Date(fechaDeConsulta(a)).getTime(),
    );

    return createPortal(
        <div className={printStyles.printArea}>
            <header className={printStyles.printHeader}>
                <div>
                    <h1 className={printStyles.printClinica}>
                        {DATOS_CLINICA.nombre}
                    </h1>
                    <p className={printStyles.printClinicaDato}>
                        {DATOS_CLINICA.direccion}
                    </p>
                    <p className={printStyles.printClinicaDato}>
                        Tel. {DATOS_CLINICA.telefono} · {DATOS_CLINICA.correo}
                    </p>
                </div>
                <div className={printStyles.printComprobante}>
                    <h2 className={printStyles.printTitulo}>
                        Historial clínico
                    </h2>
                    <p className={printStyles.printClinicaDato}>
                        Emitido el{' '}
                        {new Date().toLocaleDateString('es', {
                            dateStyle: 'long',
                        })}
                    </p>
                    <p className={printStyles.printClinicaDato}>
                        {rango
                            ? `Período: ${fechaRango(rango.desde)} – ${fechaRango(rango.hasta)}`
                            : 'Historial completo'}
                    </p>
                </div>
            </header>

            <section className={styles.printFicha}>
                {mascota.imagenUrl && (
                    <img
                        src={mascota.imagenUrl}
                        alt=""
                        className={styles.printFoto}
                    />
                )}
                <div className={printStyles.printDatos}>
                    <div className={printStyles.printDato}>
                        <span>Mascota</span>
                        <span>{mascota.nombre}</span>
                    </div>
                    <div className={printStyles.printDato}>
                        <span>Especie</span>
                        <span>{mascota.especie}</span>
                    </div>
                    <div className={printStyles.printDato}>
                        <span>Raza</span>
                        <span>{mascota.raza ?? '-'}</span>
                    </div>
                    <div className={printStyles.printDato}>
                        <span>Sexo</span>
                        <span>{mascota.sexo}</span>
                    </div>
                    <div className={printStyles.printDato}>
                        <span>Fecha de nacimiento</span>
                        <span>
                            {mascota.fechaNac
                                ? // Se guarda como fecha a medianoche UTC; en UTC no cambia de día.
                                  new Date(
                                      mascota.fechaNac,
                                  ).toLocaleDateString('es', {
                                      timeZone: 'UTC',
                                  })
                                : '-'}
                        </span>
                    </div>
                    <div className={printStyles.printDato}>
                        <span>Peso</span>
                        <span>{mascota.peso ? `${mascota.peso} kg` : '-'}</span>
                    </div>
                    <div className={printStyles.printDato}>
                        <span>Propietario</span>
                        <span>{mascota.cliente?.nombre ?? '-'}</span>
                    </div>
                    <div className={printStyles.printDato}>
                        <span>Teléfono</span>
                        <span>{mascota.cliente?.telefono ?? '-'}</span>
                    </div>
                </div>
            </section>

            {ordenadas.map((h) => {
                const servicios = h.facturas
                    .flatMap((f) => f.detalles)
                    .filter((d) => d.servicio);

                return (
                    <article key={h.id} className={styles.printConsulta}>
                        <div className={styles.printConsultaHeader}>
                            <b>
                                {new Date(fechaDeConsulta(h)).toLocaleString(
                                    'es',
                                    { dateStyle: 'long', timeStyle: 'short' },
                                )}
                            </b>
                            <span>
                                {h.cita?.usuario?.nombre ??
                                    'Veterinario no registrado'}
                            </span>
                        </div>

                        <dl className={styles.printConsultaDatos}>
                            <dt>Motivo</dt>
                            <dd>{h.cita?.motivo || '-'}</dd>
                            {(h.peso != null || h.temperatura != null) && (
                                <>
                                    <dt>Signos</dt>
                                    <dd>
                                        {[
                                            h.peso != null &&
                                                `Peso ${h.peso} kg`,
                                            h.temperatura != null &&
                                                `Temperatura ${h.temperatura} °C`,
                                        ]
                                            .filter(Boolean)
                                            .join(' · ')}
                                    </dd>
                                </>
                            )}
                            <dt>Diagnóstico</dt>
                            <dd>{h.diagnostico || '-'}</dd>
                            <dt>Tratamiento</dt>
                            <dd>{h.tratamiento || '-'}</dd>
                            {h.observaciones && (
                                <>
                                    <dt>Observaciones</dt>
                                    <dd>{h.observaciones}</dd>
                                </>
                            )}
                            {h.insumos.length > 0 && (
                                <>
                                    <dt>Insumos</dt>
                                    <dd>
                                        {h.insumos
                                            .map(
                                                (i) =>
                                                    `${i.insumo.nombre} (x${i.cantidad})`,
                                            )
                                            .join(', ')}
                                    </dd>
                                </>
                            )}
                            {servicios.length > 0 && (
                                <>
                                    <dt>Servicios</dt>
                                    <dd>
                                        {servicios
                                            .map((d) => d.servicio?.nombre)
                                            .join(', ')}
                                    </dd>
                                </>
                            )}
                        </dl>
                    </article>
                );
            })}

            <footer className={printStyles.printPie}>
                <p className={printStyles.printGracias}>
                    Consultas incluidas: {ordenadas.length}
                </p>
                <p className={printStyles.printLeyenda}>
                    Documento de uso clínico
                </p>
            </footer>
        </div>,
        document.body,
    );
}
