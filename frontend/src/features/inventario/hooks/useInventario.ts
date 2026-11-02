import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getInventario,
    createInsumo,
    updateInsumo,
    registrarEntrada,
    darDeBajaInsumo,
    getMovimientos,
    type EntradaPayload,
    type Insumo,
} from '../../../api/inventario.api';
import { useAuthStore } from '../../auth/useAuthStore';
import { getErrorMessage } from '../../../utils/getErrorMessage';

const initialForm = {
    nombre: '',
    lote: '',
    fechaVenc: '',
    stock: '',
    stockMinimo: '5',
    precioUnit: '',
};

const initialFormReabastecer = { cantidad: '', lote: '', fechaVenc: '' };

export function useInventario() {
    const queryClient = useQueryClient();
    const { data: insumos, isLoading } = useQuery({
        queryKey: ['inventario'],
        queryFn: getInventario,
    });

    const usuario = useAuthStore((s) => s.usuario);
    const puedeCrear = usuario
        ? ['GERENTE', 'RECEPCION'].includes(usuario.rol)
        : false;

    const puedeEditar = usuario
        ? ['GERENTE', 'INVENTARIO'].includes(usuario.rol)
        : false;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState(initialForm);
    const [entradas, setEntradas] = useState<Record<string, string>>({});
    const [imagen, setImagen] = useState<File | null>(null);

    const cerrarModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setForm(initialForm);
        setImagen(null);
    };

    // Stock, lote y vencimiento alimentan las alertas del dashboard, la campana y el menú.
    const invalidarInventarioYAlertas = () => {
        for (const queryKey of [
            ['inventario'],
            ['dashboard'],
            ['notificaciones'],
        ]) {
            queryClient.invalidateQueries({ queryKey });
        }
    };

    const createMutation = useMutation({
        mutationFn: createInsumo,
        onSuccess: () => {
            invalidarInventarioYAlertas();
            cerrarModal();
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: FormData }) =>
            updateInsumo(id, data),
        onSuccess: () => {
            invalidarInventarioYAlertas();
            cerrarModal();
        },
    });

    // Solo el error de la operación en curso (crear o editar), nunca uno anterior.
    const guardarMutation = editingId ? updateMutation : createMutation;

    const [aviso, setAviso] = useState<{
        tipo: 'exito' | 'error';
        texto: string;
    } | null>(null);

    useEffect(() => {
        if (!aviso) return;
        const timer = setTimeout(() => setAviso(null), 6000);
        return () => clearTimeout(timer);
    }, [aviso]);

    const entradaMutation = useMutation({
        mutationFn: ({ id, cantidad }: { id: string; cantidad: number }) =>
            registrarEntrada(id, { cantidad }),
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: ['inventario'] }),
        onError: (error) =>
            setAviso({
                tipo: 'error',
                texto: getErrorMessage(
                    error,
                    'No se pudo registrar la entrada.',
                ),
            }),
    });

    // Confirmación de baja por vencimiento.
    const [insumoBaja, setInsumoBaja] = useState<Insumo | null>(null);

    const bajaMutation = useMutation({
        mutationFn: darDeBajaInsumo,
        onSuccess: () => {
            invalidarInventarioYAlertas();
            if (insumoBaja) {
                setAviso({
                    tipo: 'exito',
                    texto: `Se dieron de baja ${insumoBaja.stock} unidades de ${insumoBaja.nombre}.`,
                });
            }
            setInsumoBaja(null);
        },
    });

    const abrirBaja = (insumo: Insumo) => {
        bajaMutation.reset();
        setInsumoBaja(insumo);
    };

    const cerrarBaja = () => setInsumoBaja(null);

    // Reabastecimiento de un producto vencido sin existencias, con lote y vencimiento nuevos.
    const [insumoReabastecer, setInsumoReabastecer] = useState<Insumo | null>(
        null,
    );
    const [formReabastecer, setFormReabastecer] = useState(
        initialFormReabastecer,
    );

    const reabastecerMutation = useMutation({
        mutationFn: ({
            id,
            cantidad,
            lote,
            fechaVenc,
        }: EntradaPayload & {
            id: string;
        }) => registrarEntrada(id, { cantidad, lote, fechaVenc }),
        onSuccess: (insumo) => {
            invalidarInventarioYAlertas();
            setAviso({
                tipo: 'exito',
                texto: `${insumo.nombre} reabastecido con el lote ${insumo.lote ?? ''}.`,
            });
            setInsumoReabastecer(null);
        },
    });

    const abrirReabastecer = (insumo: Insumo) => {
        reabastecerMutation.reset();
        setFormReabastecer(initialFormReabastecer);
        setInsumoReabastecer(insumo);
    };

    const cerrarReabastecer = () => setInsumoReabastecer(null);

    const handleReabastecer = (e: React.FormEvent) => {
        e.preventDefault();
        if (!insumoReabastecer) return;
        reabastecerMutation.mutate({
            id: insumoReabastecer.id,
            cantidad: Number(formReabastecer.cantidad),
            lote: formReabastecer.lote.trim(),
            fechaVenc: formReabastecer.fechaVenc,
        });
    };

    // Historial de movimientos (reutiliza GET /inventario/:id/movimientos).
    const [insumoHistorial, setInsumoHistorial] = useState<Insumo | null>(null);

    const historialQuery = useQuery({
        queryKey: ['inventario', insumoHistorial?.id, 'movimientos'],
        queryFn: () => getMovimientos(insumoHistorial?.id ?? ''),
        enabled: insumoHistorial !== null,
    });

    const abrirNuevo = () => {
        createMutation.reset();
        setEditingId(null);
        setForm(initialForm);
        setImagen(null);
        setIsModalOpen(true);
    };

    const abrirEdicion = (insumo: Insumo) => {
        updateMutation.reset();
        setEditingId(insumo.id);
        setForm({
            nombre: insumo.nombre,
            lote: insumo.lote ?? '',
            fechaVenc: insumo.fechaVenc ? insumo.fechaVenc.slice(0, 10) : '',
            stock: String(insumo.stock),
            stockMinimo: String(insumo.stockMinimo),
            precioUnit: String(insumo.precioUnit),
        });
        setImagen(null);
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const data = new FormData();
        data.append('nombre', form.nombre);
        // Lote y vencimiento se envían aunque estén vacíos para poder limpiarlos al editar.
        data.append('lote', form.lote);
        data.append('fechaVenc', form.fechaVenc);
        // El stock solo se envía al crear: luego cambia por entradas, consultas o ventas.
        if (!editingId) data.append('stock', form.stock);
        if (form.stockMinimo) data.append('stockMinimo', form.stockMinimo);
        data.append('precioUnit', form.precioUnit);
        if (imagen) data.append('imagen', imagen);

        if (editingId) {
            updateMutation.mutate({ id: editingId, data });
        } else {
            createMutation.mutate(data);
        }
    };

    return {
        insumos,
        isLoading,
        puedeCrear,
        puedeEditar,
        isModalOpen,
        editingId,
        abrirNuevo,
        abrirEdicion,
        cerrarModal,
        form,
        setForm,
        entradas,
        setEntradas,
        imagen,
        setImagen,
        entradaMutation,
        aviso,
        insumoBaja,
        abrirBaja,
        cerrarBaja,
        bajaMutation,
        insumoHistorial,
        abrirHistorial: setInsumoHistorial,
        cerrarHistorial: () => setInsumoHistorial(null),
        historialQuery,
        insumoReabastecer,
        formReabastecer,
        setFormReabastecer,
        abrirReabastecer,
        cerrarReabastecer,
        handleReabastecer,
        reabastecerMutation,
        handleSubmit,
        isSaving: guardarMutation.isPending,
        isError: guardarMutation.isError,
        error: guardarMutation.error,
    };
}
