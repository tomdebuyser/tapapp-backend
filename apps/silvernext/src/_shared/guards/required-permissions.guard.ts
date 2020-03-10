import {
    ExecutionContext,
    Injectable,
    CanActivate,
    ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DeepPartial } from 'typeorm';

import { Permissions } from '@libs/database';
import { IUserSession } from '../constants';
import { containsPermissionsObject } from '../../_util/permissions.helper';

export class PermissionDenied extends ForbiddenException {
    constructor() {
        super(
            'The required permissions to perform this action were not found',
            'PERMISSION_DENIED',
        );
    }
}

/**
 * Passing the required permissions is done through the RequiredPermissions decorator.
 */
@Injectable()
export class RequiredPermissionsGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    public canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const session: IUserSession = request.user;
        const requiredPermissions = this.reflector.get<
            DeepPartial<Permissions>
        >('permissions', context.getHandler());
        return canActivateWithPermissions(
            session?.permissions,
            requiredPermissions,
        );
    }
}

function canActivateWithPermissions(
    permissions: Permissions,
    requiredPermissions: DeepPartial<Permissions>,
): boolean {
    if (!containsPermissionsObject(permissions, requiredPermissions)) {
        throw new PermissionDenied();
    }
    return true;
}
