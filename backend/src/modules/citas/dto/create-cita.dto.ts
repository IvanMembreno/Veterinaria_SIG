import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class CreateCitaDto {
    @IsString()
    @IsNotEmpty()
    mascotaId!: string;

    @IsString()
    @IsNotEmpty()
    usuarioId!: string;

    @IsDateString()
    fecha!: string;

    @IsString()
    @IsNotEmpty()
    motivo!: string;
}
