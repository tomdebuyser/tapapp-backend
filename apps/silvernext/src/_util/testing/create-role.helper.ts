import { DeepPartial } from 'typeorm';
import { mergeDeepLeft } from 'ramda';
import * as faker from 'faker';

import { Role } from '@libs/database';
import { createDefaultPermissions } from '../permissions.helper';

export function createTestRole(overrides?: DeepPartial<Role>): Role {
    const role: DeepPartial<Role> = {
        name: faker.name.jobTitle(),
        permissions: createDefaultPermissions({
            users: {
                view: true,
                edit: true,
            },
        }),
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    return Role.create(mergeDeepLeft(overrides, role));
}
