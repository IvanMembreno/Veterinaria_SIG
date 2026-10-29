import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateInsumoDto } from './create-insumo.dto.js';

// El stock no se edita aquí: solo cambia por entradas, consultas o ventas.
export class UpdateInsumoDto extends PartialType(
    OmitType(CreateInsumoDto, ['stock'] as const),
) {}
