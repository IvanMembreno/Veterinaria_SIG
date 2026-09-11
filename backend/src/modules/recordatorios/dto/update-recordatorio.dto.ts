import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsOptional } from 'class-validator';
import { CreateRecordatorioDto } from './create-recordatorio.dto.js';
import { EstadoRecordatorio } from '../../../generated/prisma/enums.js';

export class UpdateRecordatorioDto extends PartialType(CreateRecordatorioDto) {
    @IsEnum(EstadoRecordatorio)
    @IsOptional()
    estado?: EstadoRecordatorio;

    @IsDate()
    @Type(() => Date)
    @IsOptional()
    contactoEnviado?: Date;
}
