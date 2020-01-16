import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';

import { AuthenticationService } from './authentication.service';
import { IUserSession } from '../_shared/constants';
import { AuthenticationQueries } from './authentication.queries';

@Injectable()
export class PassportLocalStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly authService: AuthenticationService,
        private readonly authQueries: AuthenticationQueries,
    ) {
        super();
    }

    async validate(username: string, password: string): Promise<IUserSession> {
        const user = await this.authService.validateCredentials(
            username,
            password,
        );
        if (!user) {
            throw new UnauthorizedException();
        }
        return this.authQueries.composeUserSession(user.id);
    }
}
