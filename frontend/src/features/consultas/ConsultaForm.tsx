import { useConsultaForm } from './hooks/useConsulta';
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
        servicioId,
        setServicioId,
        insumoId,
        setInsumoId,
        cantidadInsumo,
        setCantidadInsumo,
        handleSubmit,
    } = useConsultaForm(citaId, onClose);

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalCard}>
                <header className={styles.modalHeader}>
                    <h3>Historial Clínico & Consulta</h3>
                    <p>Completa el expediente médico de la mascota atendida.</p>
                </header>

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
                        <label htmlFor="sel-servicio">Servicio a facturar</label>
                        <select
                            id="sel-servicio"
                            value={servicioId}
                            onChange={(e) => setServicioId(e.target.value)}
                            required
                        >
                            <option value="">Selecciona el procedimiento realizado</option>
                            {servicios?.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.nombre} (${s.precio})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={insumoId ? styles.twoThirdsWidth : styles.fullWidth}>
                        <label htmlFor="sel-insumo">Insumo usado (Opcional)</label>
                        <select
                            id="sel-insumo"
                            value={insumoId}
                            onChange={(e) => setInsumoId(e.target.value)}
                        >
                            <option value="">Ninguno</option>
                            {inventario?.map((i) => (
                                <option key={i.id} value={i.id}>
                                    {i.nombre} (Stock: {i.stock})
                                </option>
                            ))}
                        </select>
                    </div>

                    {insumoId && (
                        <div className={styles.oneThirdsWidth}>
                            <label htmlFor="num-cant">Cant.</label>
                            <input
                                id="num-cant"
                                type="number"
                                min="1"
                                value={cantidadInsumo}
                                onChange={(e) => setCantidadInsumo(e.target.value)}
                                required
                            />
                        </div>
                    )}

                    <div className={`${styles.fullWidth} ${styles.actionsContainer}`}>
                        <button type="button" onClick={onClose} className={styles.cancelBtn}>
                            Cancelar
                        </button>
                        <button type="submit" className={styles.submitBtn}>
                            Guardar Consulta
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
