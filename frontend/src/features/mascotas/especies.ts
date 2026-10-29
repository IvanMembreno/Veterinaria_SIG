// Especies que se ofrecen en el formulario de mascotas. El backend guarda `especie` como texto libre,
// así que "Otro" permite escribir cualquier especie que no esté en la lista.
export const ESPECIE_OTRA = 'Otro';

export const ESPECIES = [
    'Perro',
    'Gato',
    'Ave',
    'Conejo',
    'Roedor',
    'Reptil',
    ESPECIE_OTRA,
] as const;

// Opción del select que corresponde a una especie guardada: la misma si está en la lista
// (coincidencia exacta, para no alterar el dato) o "Otro" si fue escrita a mano.
export const opcionDeEspecie = (especie: string) =>
    ESPECIES.some((e) => e === especie && e !== ESPECIE_OTRA)
        ? especie
        : ESPECIE_OTRA;
