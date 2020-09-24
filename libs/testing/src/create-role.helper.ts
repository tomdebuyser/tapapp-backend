import { DeepPartial } from 'typeorm';
import { mergeDeepLeft } from 'ramda';
import * as faker from 'faker';

import { Role } from '@libs/models';

export function createTestRole(overrides?: DeepPartial<Role>): Role {
    const role: DeepPartial<Role> = {
        name: faker.name.jobTitle(),
        permissions: {
            users: {
                view: true,
                edit: true,
            },
            roles: {
                view: false,
                edit: false,
            },
        },
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    return Role.create(mergeDeepLeft(overrides, role));
}
