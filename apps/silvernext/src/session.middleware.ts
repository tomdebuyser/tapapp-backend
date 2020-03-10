import { INestApplication } from '@nestjs/common';
import * as session from 'express-session';
import * as redis from 'redis';
import * as connectRedis from 'connect-redis';
import * as passport from 'passport';
import { Response } from 'express';

import { LoggerService } from '@libs/logger';
import { Environment } from '@libs/common';
import { Config } from './config';

const RedisStore = connectRedis(session);
const client = redis.createClient({ url: Config.redisUrl });

export function addSessionMiddleware(app: INestApplication): void {
    app.use(
        session({
            secret: Config.session.secret,
            resave: true,
            saveUninitialized: false,
            cookie: {
                maxAge: Config.session.expiresIn,
                secure:
                    Config.environment === Environment.Production ||
                    Config.environment === Environment.Staging,
            },
            store: new RedisStore({ client }),
        }),
    );

    app.use(passport.initialize());
    app.use(passport.session());

    // Be sure redis errors are logged
    const logger = app.get(LoggerService);
    client.on('error', logger.error);
}

/**
 * This function invalidates everything that is related to a session: passport logout, clear cookie, remove cookie from redis
 */
export function destroyExpressSession(
    // Using any because the build fails when using passport types for the request
    // eslint-disable-next-line
    request: any,
    response: Response,
): Promise<void> {
    return new Promise((resolve, reject) => {
        try {
            request.session.destroy(() => {
                request.logout();
                response.clearCookie('connect.sid');
                resolve();
            });
        } catch (error) {
            reject(error);
        }
    });
}
