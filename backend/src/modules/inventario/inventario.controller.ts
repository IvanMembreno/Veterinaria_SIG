import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { InventarioService } from './inventario.service.js';
import { CreateInsumoDto } from './dto/create-insumo.dto.js';
import { RegistrarEntradaDto } from './dto/registrar-entrada.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../../generated/prisma/enums.js';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('inventario')
export class InventarioController {
    constructor(private readonly inventarioService: InventarioService) {}

    @Roles(Role.GERENTE, Role.INVENTARIO)
    @Post()
    create(@Body() dto: CreateInsumoDto) {
        return this.inventarioService.create(dto);
    }

    @Get()
    findAll() {
        return this.inventarioService.findAll();
    }

    @Get(':id/movimientos')
    historial(@Param('id') id: string) {
        return this.inventarioService.historialMovimientos(id);
    }

    @Roles(Role.GERENTE, Role.INVENTARIO)
    @Post(':id/entrada')
    registrarEntrada(
        @Param('id') id: string,
        @Body() dto: RegistrarEntradaDto,
    ) {
        return this.inventarioService.registrarEntrada(id, dto);
    }
}
