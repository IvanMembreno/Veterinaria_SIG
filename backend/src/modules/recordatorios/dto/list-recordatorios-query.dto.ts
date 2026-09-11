import { IsEnum, IsOptional, IsString } from 'class-validator';
import { EstadoRecordatorio } from '../../../generated/prisma/enums.js';

export class ListRecordatoriosQueryDto {
    @IsString()
    @IsOptional()
    mascotaId?: string;

    @IsEnum(EstadoRecordatorio)
    @IsOptional()
    estado?: EstadoRecordatorio;
}
