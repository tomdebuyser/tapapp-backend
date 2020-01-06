import { DeepPartial } from 'typeorm';
import { mergeDeepLeft } from 'ramda';
import * as faker from 'faker';

import { User } from '../../database';

export function createTestUser(overrides?: DeepPartial<User>): User {
    const user = new User();
    user.email = faker.internet.email();
    user.createdAt = new Date();
    user.updatedAt = new Date();

    return mergeDeepLeft(overrides, user) as User;
}
