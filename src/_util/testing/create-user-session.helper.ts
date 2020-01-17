import { DeepPartial } from 'typeorm';
import { mergeDeepLeft } from 'ramda';
import * as faker from 'faker';

import { createTestRole } from './create-role.helper';
import { IUserSession, UserState } from '../../_shared/constants';

export function createTestUserSession(
    overrides?: DeepPartial<IUserSession>,
): IUserSession {
    const session: IUserSession = {
        userId: faker.random.uuid(),
        email: faker.internet.email(),
        state: UserState.Active,
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        roles: [createTestRole()],
    };

    return mergeDeepLeft(overrides, session) as IUserSession;
}
