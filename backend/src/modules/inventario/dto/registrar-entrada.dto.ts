import {
    IsDateString,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    Min,
} from 'class-validator';

export class RegistrarEntradaDto {
    @IsInt()
    @Min(1)
    cantidad!: number;

    @IsString()
    @IsOptional()
    nota?: string;

    // Lote y vencimiento nuevos: obligatorios al reabastecer un producto vencido.
    @IsString({ message: 'El lote debe ser texto.' })
    @IsNotEmpty({ message: 'El lote no puede estar vacío.' })
    @IsOptional()
    lote?: string;

    @IsDateString(
        {},
        { message: 'La fecha de vencimiento no es una fecha válida.' },
    )
    @IsOptional()
    fechaVenc?: string;
}
