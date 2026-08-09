import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module.js';
import { ConfigModule } from '@nestjs/config';
import { UsuariosModule } from './modules/usuarios/usuarios.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { CloudinaryModule } from './modules/cloudinary/cloudinary.module.js';
import { ClientesModule } from './modules/clientes/clientes.module.js';
import { MascotasModule } from './modules/mascotas/mascotas.module.js';
import { CitasModule } from './modules/citas/citas.module.js';
import { ConsultasModule } from './modules/consultas/consultas.module.js';
import { DashboardModule } from './modules/dashboard/dashboard.module.js';
import { ServiciosModule } from './modules/servicios/servicios.module.js';
import { InventarioModule } from './modules/inventario/inventario.module.js';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        PrismaModule,
        UsuariosModule,
        AuthModule,
        CloudinaryModule,
        ClientesModule,
        MascotasModule,
        CitasModule,
        ConsultasModule,
        DashboardModule,
        ServiciosModule,
        InventarioModule,
    ],
    controllers: [],
    providers: [],
    exports: [],
})
export class AppModule {}
