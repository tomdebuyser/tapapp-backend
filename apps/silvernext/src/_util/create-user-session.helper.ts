import { DeepPartial } from 'typeorm';
import { mergeDeepLeft } from 'ramda';
import * as faker from 'faker';

import { UserState } from '@libs/database';
import { IUserSession } from '../_shared/constants';
import { createDefaultPermissions } from './permissions.helper';

export function createTestUserSession(
    overrides?: DeepPartial<IUserSession>,
): IUserSession {
    const session: IUserSession = {
        userId: faker.random.uuid(),
        email: faker.internet.email(),
        state: UserState.Active,
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        permissions: createDefaultPermissions(),
    };

    return mergeDeepLeft(overrides, session) as IUserSession;
}
