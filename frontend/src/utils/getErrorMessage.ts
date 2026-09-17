import { isAxiosError } from 'axios';

export function getErrorMessage(
    error: unknown,
    fallback = 'Ocurrió un error inesperado.',
): string {
    if (isAxiosError(error)) {
        const data = error.response?.data as
            { message?: string | string[] } | undefined;
        if (Array.isArray(data?.message)) return data.message.join(', ');
        if (typeof data?.message === 'string') return data.message;
    }
    return fallback;
}
