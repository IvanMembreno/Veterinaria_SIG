import { Type } from 'class-transformer';
import {
    ArrayNotEmpty,
    IsArray,
    IsIn,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    Min,
    ValidateNested,
} from 'class-validator';

export type TipoItemVenta = 'servicio' | 'insumo';

class VentaItemDto {
    @IsIn(['servicio', 'insumo'])
    tipo!: TipoItemVenta;

    @IsString()
    @IsNotEmpty()
    id!: string;

    @IsInt()
    @Min(1)
    cantidad!: number;
}

export class CreateVentaDto {
    @IsArray()
    @ArrayNotEmpty()
    @ValidateNested({ each: true })
    @Type(() => VentaItemDto)
    items!: VentaItemDto[];

    @IsString()
    @IsOptional()
    metodoPago?: string;
}
