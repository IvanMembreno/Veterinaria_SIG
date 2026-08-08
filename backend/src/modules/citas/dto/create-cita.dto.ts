import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsString } from 'class-validator';

export class CreateCitaDto {
    @IsString()
    @IsNotEmpty()
    mascotaId!: string;

    @IsString()
    @IsNotEmpty()
    usuarioId!: string;

    @IsDate()
    @Type(() => Date)
    fecha!: Date;

    @IsString()
    @IsNotEmpty()
    motivo!: string;
}
