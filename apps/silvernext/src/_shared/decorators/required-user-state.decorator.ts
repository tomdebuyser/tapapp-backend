import { SetMetadata } from '@nestjs/common';

import { UserState } from '@libs/database';

/**
 * This decorator is used in combination with RequiredUserStateGuard
 */
// eslint-disable-next-line
export const SetUserStateMetadata = (...states: UserState[]) =>
    SetMetadata('states', states);
