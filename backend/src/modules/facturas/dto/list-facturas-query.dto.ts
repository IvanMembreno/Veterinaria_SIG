import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { EstadoFactura } from '../../../generated/prisma/enums.js';

export class ListFacturasQueryDto {
    @IsDateString()
    @IsOptional()
    desde?: string;

    @IsDateString()
    @IsOptional()
    hasta?: string;

    @IsString()
    @IsOptional()
    clienteId?: string;

    @IsEnum(EstadoFactura)
    @IsOptional()
    estado?: EstadoFactura;
}
