import { SetMetadata } from '@nestjs/common';
import { DeepPartial } from 'typeorm';

import { Permissions } from '../../database';

// eslint-disable-next-line
export const SetPermissionsMetadata = (permissions: DeepPartial<Permissions>) =>
    SetMetadata('permissions', permissions);
