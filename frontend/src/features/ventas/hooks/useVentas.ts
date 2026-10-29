import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getInventario, type Insumo } from '../../../api/inventario.api';
import { getServicios, type Servicio } from '../../../api/servicios.api';
import {
    crearVenta,
    type Factura,
    type TipoItemVenta,
    type VentaItem,
} from '../../../api/ventas.api';

export interface CartItem {
    key: string;
    tipo: TipoItemVenta;
    id: string;
    nombre: string;
    precio: number;
    cantidad: number;
    stockDisponible?: number;
}

export function useVentas() {
    const queryClient = useQueryClient();

    const { data: insumos, isLoading: isLoadingInsumos } = useQuery({
        queryKey: ['inventario'],
        queryFn: getInventario,
    });
    const { data: servicios, isLoading: isLoadingServicios } = useQuery({
        queryKey: ['servicios'],
        queryFn: getServicios,
    });

    const [busqueda, setBusqueda] = useState('');
    const [carrito, setCarrito] = useState<CartItem[]>([]);
    const [metodoPago, setMetodoPago] = useState('efectivo');
    const [isCobroModalOpen, setIsCobroModalOpen] = useState(false);
    const [facturaGenerada, setFacturaGenerada] = useState<Factura | null>(
        null,
    );

    const termino = busqueda.trim().toLowerCase();

    const productosFiltrados = useMemo(() => {
        if (!termino) return [];
        return (insumos ?? []).filter((i) =>
            i.nombre.toLowerCase().includes(termino),
        );
    }, [insumos, termino]);

    const serviciosFiltrados = useMemo(() => {
        if (!termino) return [];
        return (servicios ?? []).filter((s) =>
            s.nombre.toLowerCase().includes(termino),
        );
    }, [servicios, termino]);

    const agregarProducto = (insumo: Insumo) => {
        if (insumo.stock <= 0) return;
        setCarrito((prev) => {
            const key = `insumo-${insumo.id}`;
            const existente = prev.find((i) => i.key === key);
            if (existente) {
                return prev.map((i) =>
                    i.key === key
                        ? {
                              ...i,
                              cantidad: Math.min(i.cantidad + 1, insumo.stock),
                          }
                        : i,
                );
            }
            return [
                ...prev,
                {
                    key,
                    tipo: 'insumo',
                    id: insumo.id,
                    nombre: insumo.nombre,
                    precio: insumo.precioUnit,
                    cantidad: 1,
                    stockDisponible: insumo.stock,
                },
            ];
        });
    };

    const agregarServicio = (servicio: Servicio) => {
        setCarrito((prev) => {
            const key = `servicio-${servicio.id}`;
            const existente = prev.find((i) => i.key === key);
            if (existente) {
                return prev.map((i) =>
                    i.key === key ? { ...i, cantidad: i.cantidad + 1 } : i,
                );
            }
            return [
                ...prev,
                {
                    key,
                    tipo: 'servicio',
                    id: servicio.id,
                    nombre: servicio.nombre,
                    precio: servicio.precio,
                    cantidad: 1,
                },
            ];
        });
    };

    const actualizarCantidad = (key: string, cantidad: number) => {
        setCarrito((prev) =>
            prev.map((i) => {
                if (i.key !== key) return i;
                const max = i.stockDisponible ?? Infinity;
                const cantidadValida = Math.min(Math.max(1, cantidad), max);
                return { ...i, cantidad: cantidadValida };
            }),
        );
    };

    const quitarDelCarrito = (key: string) => {
        setCarrito((prev) => prev.filter((i) => i.key !== key));
    };

    const total = useMemo(
        () => carrito.reduce((acc, i) => acc + i.precio * i.cantidad, 0),
        [carrito],
    );

    const ventaMutation = useMutation({
        mutationFn: crearVenta,
        onSuccess: (factura) => {
            setFacturaGenerada(factura);
            setCarrito([]);
            queryClient.invalidateQueries({ queryKey: ['inventario'] });
        },
    });

    const abrirCobro = () => {
        if (carrito.length === 0) return;
        setIsCobroModalOpen(true);
    };

    const confirmarCobro = () => {
        const items: VentaItem[] = carrito.map((i) => ({
            tipo: i.tipo,
            id: i.id,
            cantidad: i.cantidad,
        }));
        ventaMutation.mutate({ items, metodoPago });
    };

    const cerrarCobro = () => {
        setIsCobroModalOpen(false);
        setFacturaGenerada(null);
        ventaMutation.reset();
    };

    return {
        isLoading: isLoadingInsumos || isLoadingServicios,
        busqueda,
        setBusqueda,
        productosFiltrados,
        serviciosFiltrados,
        carrito,
        agregarProducto,
        agregarServicio,
        actualizarCantidad,
        quitarDelCarrito,
        total,
        metodoPago,
        setMetodoPago,
        isCobroModalOpen,
        abrirCobro,
        ventaMutation,
        facturaGenerada,
        confirmarCobro,
        cerrarCobro,
    };
}
