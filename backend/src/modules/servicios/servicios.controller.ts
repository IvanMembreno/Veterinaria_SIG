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
import { ServiciosService } from './servicios.service.js';
import { CreateServicioDto } from './dto/create-servicio.dto.js';
import { UpdateServicioDto } from './dto/update-servicio.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../../generated/prisma/enums.js';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('servicios')
export class ServiciosController {
    constructor(private readonly serviciosService: ServiciosService) {}

    @Roles(Role.GERENTE)
    @Post()
    create(@Body() dto: CreateServicioDto) {
        return this.serviciosService.create(dto);
    }

    @Get()
    findAll() {
        return this.serviciosService.findAll();
    }

    @Roles(Role.GERENTE)
    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateServicioDto) {
        return this.serviciosService.update(id, dto);
    }

    @Roles(Role.GERENTE)
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.serviciosService.remove(id);
    }
}
