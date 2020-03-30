import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Request } from 'express';

import { AuthenticationService } from './authentication.service';
import { IUserSession } from '../_shared/constants';
import { AuthenticationQueries } from './authentication.queries';

@Injectable()
export class PassportLocalStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly authService: AuthenticationService,
        private readonly authQueries: AuthenticationQueries,
    ) {
        super({ passReqToCallback: true });
    }

    async validate(
        req: Request,
        username: string,
        password: string,
    ): Promise<IUserSession> {
        // Using promise chain here because it's easier and less verbose to handle multiple errors
        return new Promise((resolve, reject) =>
            this.authService
                .login(username, password)
                .then(user => this.authQueries.composeUserSession(user.id))
                .then(session => req.logIn(session, () => resolve(session)))
                .catch(error => reject(error)),
        );
    }
}
