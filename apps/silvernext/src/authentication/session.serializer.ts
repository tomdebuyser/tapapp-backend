import { PassportSerializer } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

import { LoggerService } from '@libs/logger';
import { IUserSession } from '../_shared/constants';
import { AuthenticationQueries } from './authentication.queries';

const context = 'SessionSerializer';

@Injectable()
export class SessionSerializer extends PassportSerializer {
    constructor(
        private readonly authQueries: AuthenticationQueries,
        private readonly logger: LoggerService,
    ) {
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
            this.logger.warn('Failed to deserialize userId into session', {
                context,
                userId,
                error,
            });
            done(error);
        }
    }
}
