import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service.js';
import { CreateClienteDto } from './dto/create-cliente.dto.js';
import { UpdateClienteDto } from './dto/update-cliente.dto.js';

@Injectable()
export class ClientesService {
    constructor(private readonly prisma: PrismaService) {}

    // La fecha de consentimiento se registra al pasar a true y se limpia al pasar a false.
    private resolverConsentimiento<T extends UpdateClienteDto>(
        dto: T,
        actual?: { aceptaRecordatorios: boolean },
    ) {
        const { consentimientoFecha, ...resto } = dto;
        const acepta =
            dto.aceptaRecordatorios ?? actual?.aceptaRecordatorios ?? false;

        if (!acepta) return { ...resto, consentimientoFecha: null };
        if (consentimientoFecha) {
            return {
                ...resto,
                consentimientoFecha: new Date(consentimientoFecha),
            };
        }
        if (actual?.aceptaRecordatorios) return resto;
        return { ...resto, consentimientoFecha: new Date() };
    }

    create(dto: CreateClienteDto) {
        return this.prisma.cliente.create({
            data: this.resolverConsentimiento(dto),
        });
    }

    findAll() {
        return this.prisma.cliente.findMany({
            include: { mascotas: true },
            orderBy: { nombre: 'asc' },
        });
    }

    async findOne(id: string) {
        const cliente = await this.prisma.cliente.findUnique({
            where: { id },
            include: { mascotas: true },
        });
        if (!cliente) throw new NotFoundException('Cliente no encontrado');
        return cliente;
    }

    async update(id: string, dto: UpdateClienteDto) {
        const actual = await this.findOne(id);
        return this.prisma.cliente.update({
            where: { id },
            data: this.resolverConsentimiento(dto, actual),
        });
    }

    async remove(id: string) {
        await this.findOne(id);
        return this.prisma.cliente.delete({ where: { id } });
    }
}
