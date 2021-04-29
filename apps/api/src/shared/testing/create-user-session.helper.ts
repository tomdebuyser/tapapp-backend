import { DeepPartial } from 'typeorm';
import { mergeDeepLeft } from 'ramda';
import * as faker from 'faker';

import { User, UserType } from '@libs/models';
import { UserSession } from '../constants';

export function createTestUserSession(
    user?: User,
    overrides?: DeepPartial<UserSession>,
): UserSession {
    const session: UserSession = {
        userId: user?.id || faker.datatype.uuid(),
        type: user?.type || UserType.User,
        isActive: user?.isActive || true,
        email: user?.email || faker.internet.email(),
        name: user?.name || faker.name.firstName(),
        organisation: {
            id: user?.organisation?.id || faker.datatype.uuid(),
            isActive: user?.organisation?.isActive || true,
        },
    };

    return mergeDeepLeft(overrides, session) as UserSession;
}
