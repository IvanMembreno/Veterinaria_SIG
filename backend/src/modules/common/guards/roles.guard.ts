import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { ROLES_KEY } from '../decorators/roles.decorator.js';
import { Role, Usuario } from '../../../generated/prisma/client.js';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<Role[]>(
            ROLES_KEY,
            [context.getHandler(), context.getClass()],
        );
        if (!requiredRoles || requiredRoles.length === 0) return true;

        const req = context.switchToHttp().getRequest<Request>();

        const user = req.user as Usuario | undefined;

        if (!user || !user.rol) return false;

        return requiredRoles.includes(user?.rol);
    }
}
