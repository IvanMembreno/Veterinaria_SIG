import { useConsultaForm } from './hooks/useConsulta';
import { Modal } from '../../components/ui/Modal';
import styles from './styles/consulta.module.css';

interface Props {
    citaId: string;
    onClose: () => void;
}

export function ConsultaForm({ citaId, onClose }: Props) {
    const {
        servicios,
        inventario,
        diagnostico,
        setDiagnostico,
        tratamiento,
        setTratamiento,
        peso,
        setPeso,
        temperatura,
        setTemperatura,
        serviciosLineas,
        agregarServicioLinea,
        actualizarServicioLinea,
        quitarServicioLinea,
        insumosLineas,
        agregarInsumoLinea,
        actualizarInsumoLinea,
        quitarInsumoLinea,
        handleSubmit,
    } = useConsultaForm(citaId, onClose);

    return (
        <Modal isOpen onClose={onClose} title="Historial Clínico y Consulta">
            <p className={styles.formHint}>
                Completa el expediente médico de la mascota atendida.
            </p>

            <form onSubmit={handleSubmit} className={styles.formGrid}>
                <div className={styles.fullWidth}>
                    <label htmlFor="txt-diagnostico">Diagnóstico</label>
                    <textarea
                        id="txt-diagnostico"
                        placeholder="Describe los síntomas observados y valoración médica..."
                        value={diagnostico}
                        onChange={(e) => setDiagnostico(e.target.value)}
                        required
                    />
                </div>

                <div className={styles.fullWidth}>
                    <label htmlFor="txt-tratamiento">Tratamiento</label>
                    <textarea
                        id="txt-tratamiento"
                        placeholder="Medicamentos, dosis y recomendaciones generales..."
                        value={tratamiento}
                        onChange={(e) => setTratamiento(e.target.value)}
                        required
                    />
                </div>

                <div className={styles.halfWidth}>
                    <label htmlFor="num-peso">Peso (kg)</label>
                    <input
                        id="num-peso"
                        type="number"
                        step="0.1"
                        placeholder="0.0"
                        value={peso}
                        onChange={(e) => setPeso(e.target.value)}
                        required
                    />
                </div>

                <div className={styles.halfWidth}>
                    <label htmlFor="num-temp">Temperatura (°C)</label>
                    <input
                        id="num-temp"
                        type="number"
                        step="0.1"
                        placeholder="38.5"
                        value={temperatura}
                        onChange={(e) => setTemperatura(e.target.value)}
                        required
                    />
                </div>

                <div className={styles.fullWidth}>
                    <label>Servicios a facturar</label>
                    {serviciosLineas.map((linea, index) => (
                        <div key={index} className={styles.lineaRow}>
                            <select
                                aria-label={`Servicio ${index + 1}`}
                                value={linea.servicioId}
                                onChange={(e) =>
                                    actualizarServicioLinea(
                                        index,
                                        e.target.value,
                                    )
                                }
                                required={index === 0}
                            >
                                <option value="">
                                    Selecciona el procedimiento realizado
                                </option>
                                {servicios?.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.nombre} (${s.precio})
                                    </option>
                                ))}
                            </select>
                            {serviciosLineas.length > 1 && (
                                <button
                                    type="button"
                                    className={styles.removeLineaBtn}
                                    onClick={() => quitarServicioLinea(index)}
                                    title="Quitar servicio"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    ))}
                    <button
                        type="button"
                        className={styles.addLineaBtn}
                        onClick={agregarServicioLinea}
                    >
                        + Agregar servicio
                    </button>
                </div>

                <div className={styles.fullWidth}>
                    <label>Insumos usados (Opcional)</label>
                    {insumosLineas.map((linea, index) => (
                        <div key={index} className={styles.lineaRowInsumo}>
                            <select
                                aria-label={`Insumo ${index + 1}`}
                                value={linea.insumoId}
                                onChange={(e) =>
                                    actualizarInsumoLinea(index, {
                                        insumoId: e.target.value,
                                    })
                                }
                            >
                                <option value="">Selecciona un insumo</option>
                                {inventario?.map((i) => (
                                    <option key={i.id} value={i.id}>
                                        {i.nombre} (Stock: {i.stock})
                                    </option>
                                ))}
                            </select>
                            <input
                                type="number"
                                min="1"
                                aria-label={`Cantidad insumo ${index + 1}`}
                                value={linea.cantidad}
                                onChange={(e) =>
                                    actualizarInsumoLinea(index, {
                                        cantidad: e.target.value,
                                    })
                                }
                            />
                            <button
                                type="button"
                                className={styles.removeLineaBtn}
                                onClick={() => quitarInsumoLinea(index)}
                                title="Quitar insumo"
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                    <button
                        type="button"
                        className={styles.addLineaBtn}
                        onClick={agregarInsumoLinea}
                    >
                        + Agregar insumo
                    </button>
                </div>

                <div
                    className={`${styles.fullWidth} ${styles.actionsContainer}`}
                >
                    <button
                        type="button"
                        onClick={onClose}
                        className={styles.cancelBtn}
                    >
                        Cancelar
                    </button>
                    <button type="submit" className={styles.submitBtn}>
                        Guardar Consulta
                    </button>
                </div>
            </form>
        </Modal>
    );
}
