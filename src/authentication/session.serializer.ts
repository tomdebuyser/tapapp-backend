import { PassportSerializer } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

import { IUserSession } from '../_shared/constants';
import { AuthenticationQueries } from './authentication.queries';

@Injectable()
export class SessionSerializer extends PassportSerializer {
    constructor(private readonly authQueries: AuthenticationQueries) {
        super();
    }

    serializeUser(
        session: IUserSession,
        done: (err: Error, session: string) => void,
    ): void {
        done(null, session.userId);
    }

    async deserializeUser(
        userId: string,
        done: (err: Error, user?: IUserSession) => void,
    ): Promise<void> {
        try {
            const session = await this.authQueries.composeUserSession(userId);
            done(null, session);
        } catch (error) {
            done(error);
        }
    }
}
