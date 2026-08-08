import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createConsulta } from '../../api/consultas.api';
import { getServicios } from '../../api/servicios.api';
import { getInventario } from '../../api/inventario.api';

interface Props {
    citaId: string;
    onClose: () => void;
}

export function ConsultaForm({ citaId, onClose }: Props) {
    const queryClient = useQueryClient();
    const { data: servicios } = useQuery({
        queryKey: ['servicios'],
        queryFn: getServicios,
    });
    const { data: inventario } = useQuery({
        queryKey: ['inventario'],
        queryFn: getInventario,
    });

    const [diagnostico, setDiagnostico] = useState('');
    const [tratamiento, setTratamiento] = useState('');
    const [peso, setPeso] = useState('');
    const [temperatura, setTemperatura] = useState('');
    const [servicioId, setServicioId] = useState('');
    const [insumoId, setInsumoId] = useState('');
    const [cantidadInsumo, setCantidadInsumo] = useState('1');

    const mutation = useMutation({
        mutationFn: createConsulta,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['citas'] });
            queryClient.invalidateQueries({ queryKey: ['inventario'] });
            onClose();
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate({
            citaId,
            diagnostico,
            tratamiento,
            peso: peso ? Number(peso) : undefined,
            temperatura: temperatura ? Number(temperatura) : undefined,
            servicios: servicioId ? [{ servicioId, cantidad: 1 }] : [],
            insumos: insumoId
                ? [{ insumoId, cantidad: Number(cantidadInsumo) }]
                : [],
        });
    };

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <div style={{ background: 'white', padding: 24, width: 400 }}>
                <h3>Registrar consulta</h3>
                <form
                    onSubmit={handleSubmit}
                    style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
                >
                    <textarea
                        placeholder="Diagnóstico"
                        value={diagnostico}
                        onChange={(e) => setDiagnostico(e.target.value)}
                    />
                    <textarea
                        placeholder="Tratamiento"
                        value={tratamiento}
                        onChange={(e) => setTratamiento(e.target.value)}
                    />
                    <input
                        type="number"
                        step="0.1"
                        placeholder="Peso"
                        value={peso}
                        onChange={(e) => setPeso(e.target.value)}
                    />
                    <input
                        type="number"
                        step="0.1"
                        placeholder="Temperatura"
                        value={temperatura}
                        onChange={(e) => setTemperatura(e.target.value)}
                    />

                    <select
                        value={servicioId}
                        onChange={(e) => setServicioId(e.target.value)}
                        required
                    >
                        <option value="">-- Servicio a facturar --</option>
                        {servicios?.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.nombre} (${s.precio})
                            </option>
                        ))}
                    </select>

                    <select
                        value={insumoId}
                        onChange={(e) => setInsumoId(e.target.value)}
                    >
                        <option value="">-- Insumo usado (opcional) --</option>
                        {inventario?.map((i) => (
                            <option key={i.id} value={i.id}>
                                {i.nombre} (stock: {i.stock})
                            </option>
                        ))}
                    </select>
                    {insumoId && (
                        <input
                            type="number"
                            min="1"
                            value={cantidadInsumo}
                            onChange={(e) => setCantidadInsumo(e.target.value)}
                        />
                    )}

                    <div style={{ display: 'flex', gap: 8 }}>
                        <button type="submit">Guardar consulta</button>
                        <button type="button" onClick={onClose}>
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
