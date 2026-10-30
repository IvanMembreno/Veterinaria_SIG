import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Post,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { InventarioService } from './inventario.service.js';
import { CreateInsumoDto } from './dto/create-insumo.dto.js';
import { UpdateInsumoDto } from './dto/update-insumo.dto.js';
import { RegistrarEntradaDto } from './dto/registrar-entrada.dto.js';
import { CloudinaryService } from '../cloudinary/cloudinary.service.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../../generated/prisma/enums.js';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('inventario')
export class InventarioController {
    constructor(
        private readonly inventarioService: InventarioService,
        private readonly cloudinaryService: CloudinaryService,
    ) {}

    @Roles(Role.GERENTE, Role.INVENTARIO)
    @Post()
    @UseInterceptors(FileInterceptor('imagen'))
    async create(
        @Body() dto: CreateInsumoDto,
        @UploadedFile() imagen?: Express.Multer.File,
    ) {
        let imagenUrl: string | undefined;
        if (imagen) {
            const result = await this.cloudinaryService.uploadImage(
                imagen,
                'veterinaria/inventario',
            );
            imagenUrl = result.secure_url;
        }
        return this.inventarioService.create(dto, imagenUrl);
    }

    @Get()
    findAll() {
        return this.inventarioService.findAll();
    }

    @Roles(Role.GERENTE, Role.INVENTARIO)
    @Patch(':id')
    @UseInterceptors(FileInterceptor('imagen'))
    async update(
        @Param('id') id: string,
        @Body() dto: UpdateInsumoDto,
        @UploadedFile() imagen?: Express.Multer.File,
    ) {
        let imagenUrl: string | undefined;
        if (imagen) {
            const result = await this.cloudinaryService.uploadImage(
                imagen,
                'veterinaria/inventario',
            );
            imagenUrl = result.secure_url;
        }
        return this.inventarioService.update(id, dto, imagenUrl);
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
