import { DeepPartial } from 'typeorm';
import { mergeDeepLeft } from 'ramda';
import * as faker from 'faker';

import { Role, Permissions } from '../../database';

export function createTestRole(overrides?: DeepPartial<Role>): Role {
    const role = new Role();
    role.name = faker.name.jobTitle();
    role.permissions = createDefaultPermissions({
        users: {
            view: true,
            edit: true,
        },
    });
    role.createdAt = new Date();
    role.updatedAt = new Date();

    return mergeDeepLeft(overrides, role) as Role;
}

export function createDefaultPermissions(
    overrides?: DeepPartial<Permissions>,
): Permissions {
    return mergeDeepLeft(overrides, {
        users: {
            view: false,
            edit: false,
        },
        roles: {
            view: false,
            edit: false,
        },
    });
}
