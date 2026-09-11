import { IsNotEmpty, IsString } from 'class-validator';

export class PagarFacturaDto {
    @IsString()
    @IsNotEmpty()
    metodoPago!: string;
}
