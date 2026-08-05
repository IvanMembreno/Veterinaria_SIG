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
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../../generated/prisma/enums';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('usuarios')
export class UsuariosController {
    constructor(private readonly usuariosService: UsuariosService) {}

    @Roles(Role.GERENTE)
    @Post()
    create(@Body() dto: CreateUsuarioDto) {
        return this.usuariosService.create(dto);
    }

    @Roles(Role.GERENTE)
    @Get()
    findAll() {
        return this.usuariosService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.usuariosService.findOne(id);
    }

    @Roles(Role.GERENTE)
    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateUsuarioDto) {
        return this.usuariosService.update(id, dto);
    }

    @Roles(Role.GERENTE)
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.usuariosService.remove(id);
    }
}
