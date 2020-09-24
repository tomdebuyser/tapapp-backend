import { SetMetadata } from '@nestjs/common';
import { DeepPartial } from 'typeorm';

import { Permissions } from '@libs/models';

/**
 * This decorator is used in combination with RequiredPermissionGuard
 */
// eslint-disable-next-line
export const RequiredPermissions = (permissions: DeepPartial<Permissions>) =>
    SetMetadata('permissions', permissions);
