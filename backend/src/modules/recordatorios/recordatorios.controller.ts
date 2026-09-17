import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import { RecordatoriosService } from './recordatorios.service.js';
import { CreateRecordatorioDto } from './dto/create-recordatorio.dto.js';
import { UpdateRecordatorioDto } from './dto/update-recordatorio.dto.js';
import { ListRecordatoriosQueryDto } from './dto/list-recordatorios-query.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../../generated/prisma/enums.js';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.GERENTE, Role.VETERINARIO, Role.RECEPCION)
@Controller('recordatorios')
export class RecordatoriosController {
    constructor(private readonly recordatoriosService: RecordatoriosService) {}

    @Get()
    findAll(@Query() query: ListRecordatoriosQueryDto) {
        return this.recordatoriosService.findAll(query);
    }

    @Post()
    create(@Body() dto: CreateRecordatorioDto) {
        return this.recordatoriosService.create(dto);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateRecordatorioDto) {
        return this.recordatoriosService.update(id, dto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.recordatoriosService.remove(id);
    }
}
