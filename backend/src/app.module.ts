import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { PrismaService } from './config/prisma.service';
import { ConfigModule } from '@nestjs/config';
import { UsuariosModule } from './modules/usuarios/usuarios.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        PrismaModule,
        UsuariosModule,
        AuthModule,
    ],
    controllers: [],
    providers: [PrismaService],
    exports: [PrismaService],
})
export class AppModule {}
