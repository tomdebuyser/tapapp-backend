import { DeepPartial } from 'typeorm';
import { mergeDeepLeft } from 'ramda';
import * as faker from 'faker';

import { User } from '@libs/models';
import { UserSession } from '../constants';

export function createTestUserSession(
    user?: User,
    overrides?: DeepPartial<UserSession>,
): UserSession {
    const session: UserSession = {
        userId: user?.id || faker.datatype.uuid(),
        email: user?.email || faker.internet.email(),
        isActive: user?.isActive || true,
        name: user?.name || faker.name.firstName(),
    };

    return mergeDeepLeft(overrides, session) as UserSession;
}
