import {
    BadGatewayException,
    GatewayTimeoutException,
    Injectable,
    Logger,
    ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const TIMEOUT_MS = 10_000;

// Errores frecuentes de la Cloud API de Meta, traducidos para el usuario.
const ERRORES_META: Record<number, string> = {
    190: 'El token de acceso de WhatsApp es inválido o expiró.',
    10: 'La aplicación no tiene permiso para enviar mensajes de WhatsApp.',
    200: 'La aplicación no tiene permiso para enviar mensajes de WhatsApp.',
    100: 'WhatsApp rechazó la solicitud por un parámetro inválido.',
    368: 'La cuenta de WhatsApp está restringida temporalmente por incumplir políticas.',
    130429: 'Se alcanzó el límite de envíos de WhatsApp. Intenta en unos minutos.',
    131026: 'El número del cliente no puede recibir mensajes (puede que no use WhatsApp).',
    131030: 'El número del cliente no está en la lista de destinatarios permitidos de la cuenta de prueba.',
    131031: 'La cuenta de WhatsApp Business está bloqueada.',
    131056: 'Se enviaron demasiados mensajes a este cliente en poco tiempo. Intenta más tarde.',
    132000: 'La plantilla de WhatsApp no coincide con la cantidad de variables enviadas.',
    132001: 'La plantilla de WhatsApp no existe o no está aprobada en ese idioma.',
    132005: 'El texto de la plantilla de WhatsApp es demasiado largo.',
    132007: 'La plantilla de WhatsApp incumple las políticas de contenido.',
    132012: 'El formato de las variables de la plantilla de WhatsApp es inválido.',
    133010: 'El número de WhatsApp Business no está registrado en la Cloud API.',
};

interface MetaRespuesta {
    messages?: { id: string }[];
    error?: {
        message?: string;
        code?: number;
        error_subcode?: number;
        fbtrace_id?: string;
    };
}

interface ConfigWhatsapp {
    token: string;
    phoneNumberId: string;
    apiVersion: string;
    templateName: string;
    templateLang: string;
    // Plantilla opcional para avisar cancelaciones de citas; vacía si no existe.
    templateCancelacion: string;
}

/**
 * "dd/MM/yyyy a las h:mm AM" en hora de El Salvador. Las fechas guardadas sin hora
 * (medianoche UTC, como las del formulario) se muestran solo como "dd/MM/yyyy".
 */
export function formatearFechaWhatsapp(fecha: Date) {
    const soloFecha =
        fecha.getUTCHours() === 0 &&
        fecha.getUTCMinutes() === 0 &&
        fecha.getUTCSeconds() === 0;
    const p = Object.fromEntries(
        new Intl.DateTimeFormat('en-US', {
            timeZone: soloFecha ? 'UTC' : 'America/El_Salvador',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        })
            .formatToParts(fecha)
            .map((parte) => [parte.type, parte.value]),
    );
    const dia = `${p.day}/${p.month}/${p.year}`;
    return soloFecha
        ? dia
        : `${dia} a las ${p.hour}:${p.minute} ${p.dayPeriod}`;
}

@Injectable()
export class WhatsappService {
    private readonly logger = new Logger(WhatsappService.name);
    private readonly config: ConfigWhatsapp | null;
    readonly clinicName: string;

    constructor(configService: ConfigService) {
        const leer = (clave: string, porDefecto = '') =>
            configService.get<string>(clave)?.trim() || porDefecto;

        this.clinicName = leer('WHATSAPP_CLINIC_NAME', 'La Garrita Feliz');
        this.config = null;

        if (leer('WHATSAPP_ENABLED').toLowerCase() !== 'true') return;

        const token = leer('WHATSAPP_TOKEN');
        const phoneNumberId = leer('WHATSAPP_PHONE_NUMBER_ID');
        const faltantes = [
            !token && 'WHATSAPP_TOKEN',
            !phoneNumberId && 'WHATSAPP_PHONE_NUMBER_ID',
        ].filter(Boolean);

        if (faltantes.length > 0) {
            this.logger.warn(
                `WHATSAPP_ENABLED=true pero faltan ${faltantes.join(', ')}; el envío por API queda deshabilitado.`,
            );
            return;
        }

        this.config = {
            token,
            phoneNumberId,
            apiVersion: leer('WHATSAPP_API_VERSION', 'v25.0'),
            templateName: leer(
                'WHATSAPP_TEMPLATE_NAME',
                'aviso_servicio_programado',
            ),
            templateLang: leer('WHATSAPP_TEMPLATE_LANG', 'es'),
            templateCancelacion: leer('WHATSAPP_TEMPLATE_CANCELACION'),
        };
    }

    get habilitado() {
        return this.config !== null;
    }

    /** Nombre de la plantilla de cancelación de citas, o null si no está configurada. */
    get plantillaCancelacion() {
        return this.config?.templateCancelacion || null;
    }

    /**
     * Envía una plantilla (por defecto WHATSAPP_TEMPLATE_NAME). `telefono` va en E.164
     * sin "+" y `variables` en el orden del cuerpo de la plantilla. Devuelve el id
     * del mensaje de Meta.
     */
    async enviarPlantilla(
        telefono: string,
        variables: string[],
        plantilla?: string,
    ) {
        if (!this.config) {
            throw new ServiceUnavailableException(
                'El envío por la API de WhatsApp no está habilitado.',
            );
        }
        const { token, phoneNumberId, apiVersion, templateLang } = this.config;
        const templateName = plantilla ?? this.config.templateName;

        let respuesta: Response;
        try {
            respuesta = await fetch(
                `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        messaging_product: 'whatsapp',
                        to: telefono,
                        type: 'template',
                        template: {
                            name: templateName,
                            language: { code: templateLang },
                            components: [
                                {
                                    type: 'body',
                                    parameters: variables.map((text) => ({
                                        type: 'text',
                                        text,
                                    })),
                                },
                            ],
                        },
                    }),
                    signal: AbortSignal.timeout(TIMEOUT_MS),
                },
            );
        } catch (error) {
            if (error instanceof Error && error.name === 'TimeoutError') {
                throw new GatewayTimeoutException(
                    'WhatsApp no respondió a tiempo (10 s). Intenta de nuevo.',
                );
            }
            this.logger.error(
                `No se pudo conectar con la API de WhatsApp: ${error instanceof Error ? error.message : 'error desconocido'}`,
            );
            throw new BadGatewayException(
                'No se pudo conectar con la API de WhatsApp.',
            );
        }

        const datos = (await respuesta
            .json()
            .catch(() => ({}))) as MetaRespuesta;
        const messageId = datos.messages?.[0]?.id;

        if (!respuesta.ok || !messageId) {
            const { code, error_subcode, fbtrace_id, message } =
                datos.error ?? {};
            this.logger.warn(
                `Meta rechazó el envío: HTTP ${respuesta.status}, código ${code ?? '-'}/${error_subcode ?? '-'}, fbtrace_id ${fbtrace_id ?? '-'}: ${message ?? 'sin detalle'}`,
            );
            throw new BadGatewayException(
                (code !== undefined && ERRORES_META[code]) ||
                    `WhatsApp rechazó el envío${code !== undefined ? ` (código ${code})` : ''}.`,
            );
        }

        return messageId;
    }
}
