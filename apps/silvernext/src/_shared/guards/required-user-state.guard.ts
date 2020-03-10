import {
    ExecutionContext,
    Injectable,
    CanActivate,
    MethodNotAllowedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { UserState } from '@libs/database';
import { IUserSession } from '../constants';

export class UserStateNotAllowed extends MethodNotAllowedException {
    constructor(state: UserState, allowedStates: UserState[]) {
        super(
            `This action is not allowed for the user state ${state}. Should be one of [${allowedStates.join(
                ', ',
            )}]`,
            'USER_STATE_NOT_ALLOWED',
        );
    }
}

/**
 * Passing the required states is done through the RequiredUserState decorator.
 */
@Injectable()
export class RequiredUserStateGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    public canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const session: IUserSession = request.user;
        const allowedStates = this.reflector.get<UserState[]>(
            'states',
            context.getHandler(),
        );
        return canActivateWithUserState(session?.state, allowedStates);
    }
}

export function canActivateWithUserState(
    state: UserState,
    allowedStates: UserState[],
): boolean {
    if (!allowedStates.includes(state)) {
        throw new UserStateNotAllowed(state, allowedStates);
    }
    return true;
}
