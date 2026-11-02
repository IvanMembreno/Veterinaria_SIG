import { IsIn, IsOptional } from 'class-validator';

export const TIPOS_AVISO_CITA = [
    'AGENDADA',
    'REPROGRAMADA',
    'CANCELADA',
] as const;
export type TipoAvisoCita = (typeof TIPOS_AVISO_CITA)[number];

export class AvisarWhatsappCitaDto {
    @IsIn(TIPOS_AVISO_CITA)
    @IsOptional()
    tipo?: TipoAvisoCita;
}
