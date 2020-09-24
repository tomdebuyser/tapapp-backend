import {
    ExecutionContext,
    Injectable,
    CanActivate,
    ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DeepPartial } from 'typeorm';

import { Permissions } from '@libs/database';
import { LoggerService } from '@libs/logger';
import { UserSession } from '../constants';
import { hasPermissions } from '../util';

const loggerContext = 'RequiredPermissionsGuard';

export class PermissionDenied extends ForbiddenException {
    constructor() {
        super(
            'Permission required to perform this action',
            'PERMISSION_DENIED',
        );
    }
}

/**
 * Passing the required permissions is done through the RequiredPermissions decorator.
 */
@Injectable()
export class RequiredPermissionsGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly logger: LoggerService,
    ) {}

    public canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const session: UserSession = request.user;
        const requiredPermissions = this.reflector.get<
            DeepPartial<Permissions>
        >('permissions', context.getHandler());

        if (!hasPermissions(session?.permissions, requiredPermissions)) {
            this.logger.warn('Permission required to perform this action', {
                context: loggerContext,
                sessionPermissions: session?.permissions,
                requiredPermissions,
            });
            throw new PermissionDenied();
        }
        return true;
    }
}
