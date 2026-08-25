import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getMascotas,
    createMascota,
    deleteMascota,
} from '../../../api/mascotas.api';
import { getClientes } from '../../../api/clientes.api';
import { useAuthStore } from '../../auth/useAuthStore';

const initialForm = {
    nombre: '',
    especie: '',
    raza: '',
    sexo: 'MACHO',
    fechaNac: '',
    peso: '',
    clienteId: '',
};

export function useMascotas() {
    const queryClient = useQueryClient();
    const { data: mascotas, isLoading } = useQuery({
        queryKey: ['mascotas'],
        queryFn: getMascotas,
    });
    const { data: clientes } = useQuery({
        queryKey: ['clientes'],
        queryFn: getClientes,
    });

    const usuario = useAuthStore((s) => s.usuario);
    const puedeCrear = usuario
        ? ['GERENTE', 'RECEPCION'].includes(usuario.rol)
        : false;

    const [form, setForm] = useState(initialForm);
    const [imagen, setImagen] = useState<File | null>(null);

    const createMutation = useMutation({
        mutationFn: createMascota,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['mascotas'] });
            setForm(initialForm);
            setImagen(null);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteMascota,
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: ['mascotas'] }),
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const data = new FormData();
        Object.entries(form).forEach(([key, value]) => {
            if (value) data.append(key, value);
        });
        if (imagen) data.append('imagen', imagen);
        createMutation.mutate(data);
    };

    return {
        mascotas,
        clientes,
        isLoading,
        puedeCrear,
        form,
        setForm,
        imagen,
        setImagen,
        deleteMutation,
        handleSubmit,
    };
}
