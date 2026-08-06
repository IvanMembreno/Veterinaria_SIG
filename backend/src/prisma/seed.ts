import 'dotenv/config';
import { Role } from '../generated/prisma/enums.js';
import { PrismaClient } from '../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

async function main() {
    const pass = await bcrypt.hash('123456', 10);

    await prisma.usuario.createMany({
        data: [
            {
                nombre: 'Admin',
                email: 'gerente@vet.com',
                password: pass,
                rol: Role.GERENTE,
            },
            {
                nombre: 'Dr. Vet',
                email: 'vet@vet.com',
                password: pass,
                rol: Role.VETERINARIO,
            },
            {
                nombre: 'Recepcion',
                email: 'recepcion@vet.com',
                password: pass,
                rol: Role.RECEPCION,
            },
            {
                nombre: 'Inventario',
                email: 'inventario@vet.com',
                password: pass,
                rol: Role.INVENTARIO,
            },
        ],
    });

    await prisma.servicio.createMany({
        data: [
            { nombre: 'Consulta general', precio: 15 },
            { nombre: 'Vacunación', precio: 20 },
            { nombre: 'Cirugía menor', precio: 80 },
        ],
    });

    await prisma.inventario.createMany({
        data: [
            {
                nombre: 'Vacuna antirrábica',
                stock: 30,
                stockMinimo: 5,
                precioUnit: 5,
            },
            {
                nombre: 'Suero fisiológico',
                stock: 50,
                stockMinimo: 10,
                precioUnit: 2,
            },
        ],
    });
}

main()
    .then(() => prisma.$disconnect())
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
