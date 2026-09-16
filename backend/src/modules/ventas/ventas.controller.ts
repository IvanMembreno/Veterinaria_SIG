import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { VentasService } from './ventas.service.js';
import { CreateVentaDto } from './dto/create-venta.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';

import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../../generated/prisma/enums.js';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('ventas')
export class VentasController {
    constructor(private readonly ventasService: VentasService) {}

    @Roles(Role.RECEPCION, Role.GERENTE)
    @Post()
    create(@Body() dto: CreateVentaDto) {
        return this.ventasService.create(dto);
    }
}
