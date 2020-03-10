import { DeepPartial } from 'typeorm';
import { mergeDeepLeft } from 'ramda';
import * as faker from 'faker';

import { User, UserState } from '@libs/database';
import { createTestRole } from './create-role.helper';

export function createTestUser(overrides?: DeepPartial<User>): User {
    const user = new User();
    user.email = faker.internet.email();
    user.createdAt = new Date();
    user.updatedAt = new Date();
    user.state = UserState.Active;
    user.roles = [createTestRole()];

    return mergeDeepLeft(overrides, user) as User;
}
