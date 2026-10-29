import { createPortal } from 'react-dom';
import { clienteDeFactura, type Factura } from '../../../api/facturas.api';
import { DATOS_CLINICA } from '../../../utils/datosClinica';
import styles from '../styles/facturas.module.css';

const dinero = (valor: number) => `$${valor.toFixed(2)}`;

const capitalizar = (texto: string) =>
    texto.charAt(0).toUpperCase() + texto.slice(1);

interface FacturaImprimibleProps {
    factura: Factura;
}

// Se monta directamente en <body>; solo es visible al imprimir (ver @media print).
export function FacturaImprimible({ factura }: FacturaImprimibleProps) {
    const cliente = clienteDeFactura(factura);
    const cita = factura.consulta?.cita;

    return createPortal(
        <div className={styles.printArea}>
            <header className={styles.printHeader}>
                <div>
                    <h1 className={styles.printClinica}>
                        {DATOS_CLINICA.nombre}
                    </h1>
                    <p className={styles.printClinicaDato}>
                        {DATOS_CLINICA.direccion}
                    </p>
                    <p className={styles.printClinicaDato}>
                        Tel. {DATOS_CLINICA.telefono} · {DATOS_CLINICA.correo}
                    </p>
                </div>
                <div className={styles.printComprobante}>
                    <h2 className={styles.printTitulo}>Comprobante de venta</h2>
                    <p className={styles.printCodigo}>
                        N.º {factura.id.slice(0, 8).toUpperCase()}
                    </p>
                </div>
            </header>

            <section className={styles.printDatos}>
                <div className={styles.printDato}>
                    <span>Fecha</span>
                    <span>
                        {new Date(factura.fecha).toLocaleString('es', {
                            dateStyle: 'long',
                            timeStyle: 'short',
                        })}
                    </span>
                </div>
                <div className={styles.printDato}>
                    <span>Estado</span>
                    <span>{factura.estado}</span>
                </div>
                {factura.metodoPago && (
                    <div className={styles.printDato}>
                        <span>Método de pago</span>
                        <span>{capitalizar(factura.metodoPago)}</span>
                    </div>
                )}
                <div className={styles.printDato}>
                    <span>Cliente</span>
                    <span>{cliente ?? 'Venta directa'}</span>
                </div>
                {cita?.mascota && (
                    <div className={styles.printDato}>
                        <span>Mascota</span>
                        <span>{cita.mascota.nombre}</span>
                    </div>
                )}
                {cita?.motivo && (
                    <div className={styles.printDato}>
                        <span>Motivo de la cita</span>
                        <span>{cita.motivo}</span>
                    </div>
                )}
            </section>

            <table className={styles.printTabla}>
                <thead>
                    <tr>
                        <th>Descripción</th>
                        <th className={styles.printNumero}>Cantidad</th>
                        <th className={styles.printNumero}>Precio unitario</th>
                        <th className={styles.printNumero}>Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    {factura.detalles.map((d) => (
                        <tr key={d.id}>
                            <td>
                                {d.servicio?.nombre ?? d.insumo?.nombre ?? 'Ítem'}
                            </td>
                            <td className={styles.printNumero}>{d.cantidad}</td>
                            <td className={styles.printNumero}>
                                {dinero(d.precio)}
                            </td>
                            <td className={styles.printNumero}>
                                {dinero(d.precio * d.cantidad)}
                            </td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr>
                        <td colSpan={3}>Total</td>
                        <td className={styles.printNumero}>
                            {dinero(factura.total)}
                        </td>
                    </tr>
                </tfoot>
            </table>

            <footer className={styles.printPie}>
                <p className={styles.printGracias}>
                    Gracias por confiar en nosotros
                </p>
                <p className={styles.printLeyenda}>
                    Comprobante no válido como documento tributario
                </p>
            </footer>
        </div>,
        document.body,
    );
}
