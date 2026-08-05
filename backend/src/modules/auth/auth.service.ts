import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsuariosService } from '../usuarios/usuarios.service.js';
import { LoginDto } from './dto/login.dto.js';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
    constructor(
        private readonly usuariosService: UsuariosService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) {}

    async login(dto: LoginDto) {
        const usuario = await this.usuariosService.findByEmail(dto.email);
        if (!usuario || !usuario.activo)
            throw new UnauthorizedException('Credenciales inválidas');

        const valido = await bcrypt.compare(dto.password, usuario.password);
        if (!valido) throw new UnauthorizedException('Credenciales inválidas');

        const payload = { sub: usuario.id, rol: usuario.rol };
        const accessToken = await this.jwtService.signAsync(payload, {
            secret: this.configService.get('JWT_SECRET'),
            expiresIn: this.configService.get('JWT_EXPIRES_IN'),
        });

        return {
            accessToken,
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                email: usuario.email,
                rol: usuario.rol,
            },
        };
    }
}
