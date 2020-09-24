import { DeepPartial } from 'typeorm';
import { mergeDeepLeft } from 'ramda';
import * as faker from 'faker';

import { UserState } from '@libs/database';
import { UserSession } from '../constants';
import { createDefaultPermissions } from '../util/permissions.helper';

export function createTestUserSession(
    overrides?: DeepPartial<UserSession>,
): UserSession {
    const session: UserSession = {
        userId: faker.random.uuid(),
        email: faker.internet.email(),
        state: UserState.Active,
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        permissions: createDefaultPermissions(),
    };

    return mergeDeepLeft(overrides, session) as UserSession;
}
