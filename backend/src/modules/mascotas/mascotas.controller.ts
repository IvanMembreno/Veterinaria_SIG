import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MascotasService } from './mascotas.service.js';
import { CreateMascotaDto } from './dto/create-mascota.dto.js';
import { UpdateMascotaDto } from './dto/update-mascota.dto.js';
import { CloudinaryService } from '../cloudinary/cloudinary.service.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../../generated/prisma/enums.js';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('mascotas')
export class MascotasController {
    constructor(
        private readonly mascotasService: MascotasService,
        private readonly cloudinaryService: CloudinaryService,
    ) {}

    @Roles(Role.GERENTE, Role.RECEPCION)
    @Post()
    @UseInterceptors(FileInterceptor('imagen'))
    async create(
        @Body() dto: CreateMascotaDto,
        @UploadedFile() imagen?: Express.Multer.File,
    ) {
        let imagenUrl: string | undefined;
        if (imagen) {
            const result = await this.cloudinaryService.uploadImage(imagen);
            imagenUrl = result.secure_url;
        }
        return this.mascotasService.create(dto, imagenUrl);
    }

    @Get()
    findAll() {
        return this.mascotasService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.mascotasService.findOne(id);
    }

    @Roles(Role.GERENTE, Role.RECEPCION)
    @Patch(':id')
    @UseInterceptors(FileInterceptor('imagen'))
    async update(
        @Param('id') id: string,
        @Body() dto: UpdateMascotaDto,
        @UploadedFile() imagen?: Express.Multer.File,
    ) {
        let imagenUrl: string | undefined;
        if (imagen) {
            const result = await this.cloudinaryService.uploadImage(imagen);
            imagenUrl = result.secure_url;
        }
        return this.mascotasService.update(id, dto, imagenUrl);
    }

    @Roles(Role.GERENTE)
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.mascotasService.remove(id);
    }
}
