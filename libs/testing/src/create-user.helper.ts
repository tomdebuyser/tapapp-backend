import { DeepPartial } from 'typeorm';
import { mergeDeepLeft } from 'ramda';
import * as faker from 'faker';

import { User, UserType } from '@libs/models';

export function createTestUser(overrides?: DeepPartial<User>): User {
    const user: DeepPartial<User> = {
        email: faker.internet.email(),
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        type: UserType.User,
        name: faker.name.firstName(),
        organisation: {
            id: faker.datatype.uuid(),
            isActive: true,
        },
    };
    // Have to cast 'as User' here because of bad typing in Ramda
    return User.create(mergeDeepLeft(overrides, user) as User);
}
