import { SetMetadata } from '@nestjs/common';

import { UserState } from '../constants';

// eslint-disable-next-line
export const SetUserStateMetadata = (...states: UserState[]) =>
    SetMetadata('states', states);
