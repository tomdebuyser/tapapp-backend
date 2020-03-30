import { DeepPartial } from 'typeorm';
import { mergeDeepLeft } from 'ramda';
import * as faker from 'faker';

import { User, UserState } from '@libs/database';
import { createTestRole } from './create-role.helper';

export function createTestUser(overrides?: DeepPartial<User>): User {
    const user: DeepPartial<User> = {
        email: faker.internet.email(),
        createdAt: new Date(),
        updatedAt: new Date(),
        state: UserState.Active,
        roles: [createTestRole()],
    };
    return User.create(mergeDeepLeft(overrides, user));
}
