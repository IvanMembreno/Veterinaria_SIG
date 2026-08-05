import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import { ClientesService } from './clientes.service.js';
import { CreateClienteDto } from './dto/create-cliente.dto.js';
import { UpdateClienteDto } from './dto/update-cliente.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../../generated/prisma/enums.js';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('clientes')
export class ClientesController {
    constructor(private readonly clientesService: ClientesService) {}

    @Roles(Role.GERENTE, Role.RECEPCION)
    @Post()
    create(@Body() dto: CreateClienteDto) {
        return this.clientesService.create(dto);
    }

    @Get()
    findAll() {
        return this.clientesService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.clientesService.findOne(id);
    }

    @Roles(Role.GERENTE, Role.RECEPCION)
    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateClienteDto) {
        return this.clientesService.update(id, dto);
    }

    @Roles(Role.GERENTE)
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.clientesService.remove(id);
    }
}
