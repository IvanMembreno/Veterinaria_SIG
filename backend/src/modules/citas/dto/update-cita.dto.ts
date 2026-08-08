import { PartialType } from '@nestjs/mapped-types';
import { CreateCitaDto } from './create-cita.dto.js';
import { IsEnum, IsOptional } from 'class-validator';
import { EstadoCita } from '../../../generated/prisma/enums.js';

export class UpdateCitaDto extends PartialType(CreateCitaDto) {
    @IsEnum(EstadoCita)
    @IsOptional()
    estado?: EstadoCita;
}
