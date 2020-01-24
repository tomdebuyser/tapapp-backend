import * as session from 'express-session';
import * as redis from 'redis';
import * as connectRedis from 'connect-redis';
import * as passport from 'passport';
import { INestApplication } from '@nestjs/common';
import { Config } from './config';
import { Response } from 'express';

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
                    Config.environment === 'production' ||
                    Config.environment === 'staging',
            },
            store: new RedisStore({ client }),
        }),
    );

    app.use(passport.initialize());
    app.use(passport.session());

    // Be sure redis errors are logged
    client.on('error', console.error);
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
