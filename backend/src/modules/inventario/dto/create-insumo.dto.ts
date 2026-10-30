import {
    IsDateString,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

// En multipart los campos vacíos llegan como '': se tratan como null para poder limpiarlos.
const vacioANull = ({ value }: { value: unknown }) =>
    value === '' ? null : value;

export class CreateInsumoDto {
    @IsString()
    @IsNotEmpty()
    nombre!: string;

    @IsString()
    @IsOptional()
    @Transform(vacioANull)
    lote?: string;

    @IsDateString()
    @IsOptional()
    @Transform(vacioANull)
    fechaVenc?: string;

    @IsNumber()
    @Type(() => Number)
    @Min(0)
    stock!: number;

    @IsNumber()
    @Type(() => Number)
    @Min(0)
    @IsOptional()
    stockMinimo?: number;

    @IsNumber()
    @Type(() => Number)
    @Min(0)
    precioUnit!: number;
}
