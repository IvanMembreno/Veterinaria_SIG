import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service.js';
import { CreateUsuarioDto } from './dto/create-usuario.dto.js';
import * as bcrypt from 'bcrypt';
import { UpdateUsuarioDto } from './dto/update-usuario.dto.js';

@Injectable()
export class UsuariosService {
    constructor(private readonly prisma: PrismaService) {}

    async create(dto: CreateUsuarioDto) {
        const existe = await this.prisma.usuario.findUnique({
            where: { email: dto.email },
        });
        if (existe) throw new ConflictException('Email ya registrado');

        const password = await bcrypt.hash(dto.password, 10);
        return this.prisma.usuario.create({
            data: { ...dto, password },
            select: {
                id: true,
                nombre: true,
                email: true,
                rol: true,
                activo: true,
            },
        });
    }

    findAll() {
        return this.prisma.usuario.findMany({
            where: { activo: true },
            select: {
                id: true,
                nombre: true,
                email: true,
                rol: true,
                activo: true,
            },
        });
    }

    async findOne(id: string) {
        const usuario = await this.prisma.usuario.findUnique({
            where: { id },
            select: {
                id: true,
                nombre: true,
                email: true,
                rol: true,
                activo: true,
            },
        });
        if (!usuario) throw new NotFoundException('Usuario no encontrado');
        return usuario;
    }

    findByEmail(email: string) {
        return this.prisma.usuario.findUnique({ where: { email } });
    }

    async update(id: string, dto: UpdateUsuarioDto) {
        await this.findOne(id);
        const data = { ...dto };
        if (dto.password) data.password = await bcrypt.hash(dto.password, 10);

        return this.prisma.usuario.update({
            where: { id },
            data,
            select: {
                id: true,
                nombre: true,
                email: true,
                rol: true,
                activo: true,
            },
        });
    }

    async remove(id: string) {
        await this.findOne(id);
        return this.prisma.usuario.update({
            where: { id },
            data: { activo: false },
            select: { id: true, nombre: true, activo: true },
        });
    }
}
