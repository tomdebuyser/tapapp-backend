import { DeepPartial } from 'typeorm';
import { mergeDeepLeft } from 'ramda';
import * as faker from 'faker';

import { UserState, User } from '@libs/models';
import { UserSession } from '../constants';

export function createTestUserSession(
    user?: User,
    overrides?: DeepPartial<UserSession>,
): UserSession {
    const session: UserSession = {
        userId: user?.id || faker.datatype.uuid(),
        email: user?.email || faker.internet.email(),
        state: user?.state || UserState.Active,
        firstName: user?.firstName || faker.name.firstName(),
        lastName: user?.lastName || faker.name.lastName(),
    };

    return mergeDeepLeft(overrides, session) as UserSession;
}
