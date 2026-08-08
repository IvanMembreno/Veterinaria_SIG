import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ConsultasService } from './consultas.service.js';
import { CreateConsultaDto } from './dto/create-consulta.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';

import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../../generated/prisma/enums.js';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('consultas')
export class ConsultasController {
    constructor(private readonly consultasService: ConsultasService) {}

    @Roles(Role.GERENTE, Role.VETERINARIO)
    @Post()
    create(@Body() dto: CreateConsultaDto) {
        return this.consultasService.create(dto);
    }

    @Get()
    findAll() {
        return this.consultasService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.consultasService.findOne(id);
    }
}
