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
import { CitasService } from './citas.service.js';
import { CreateCitaDto } from './dto/create-cita.dto.js';
import { UpdateCitaDto } from './dto/update-cita.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../../generated/prisma/enums.js';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('citas')
export class CitasController {
    constructor(private readonly citasService: CitasService) {}

    @Roles(Role.GERENTE, Role.RECEPCION)
    @Post()
    create(@Body() dto: CreateCitaDto) {
        return this.citasService.create(dto);
    }

    @Get()
    findAll() {
        return this.citasService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.citasService.findOne(id);
    }

    @Roles(Role.GERENTE, Role.RECEPCION)
    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateCitaDto) {
        return this.citasService.update(id, dto);
    }

    @Roles(Role.GERENTE, Role.RECEPCION)
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.citasService.remove(id);
    }
}
