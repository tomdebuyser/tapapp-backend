import { DeepPartial } from 'typeorm';
import { mergeDeepLeft } from 'ramda';
import * as faker from 'faker';

import { User, UserState } from '@libs/models';

export function createTestUser(overrides?: DeepPartial<User>): User {
    const user: DeepPartial<User> = {
        email: faker.internet.email(),
        createdAt: new Date(),
        updatedAt: new Date(),
        state: UserState.Active,
    };
    // Have to cast 'as User' here because of bad typing in Ramda
    return User.create(mergeDeepLeft(overrides, user) as User);
}
