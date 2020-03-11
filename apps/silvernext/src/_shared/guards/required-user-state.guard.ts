import {
    ExecutionContext,
    Injectable,
    CanActivate,
    MethodNotAllowedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { UserState } from '@libs/database';
import { IUserSession } from '../constants';
import { LoggerService } from '@libs/logger';

const loggerContext = 'RequiredUserStateGuard';

export class UserStateNotAllowed extends MethodNotAllowedException {
    constructor() {
        super('Action not allowed for this user', 'USER_STATE_NOT_ALLOWED');
    }
}

/**
 * Passing the required states is done through the RequiredUserState decorator.
 */
@Injectable()
export class RequiredUserStateGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly logger: LoggerService,
    ) {}

    public canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const session: IUserSession = request.user;
        const allowedStates = this.reflector.get<UserState[]>(
            'states',
            context.getHandler(),
        );

        if (!allowedStates.includes(session?.state)) {
            this.logger.warn('This action is not allowed for this user', {
                context: loggerContext,
                state: session?.state,
                allowedStates: [UserState.Active, UserState.Registering],
            });
            throw new UserStateNotAllowed();
        }
        return true;
    }
}
