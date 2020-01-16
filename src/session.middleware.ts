import * as session from 'express-session';
import * as redis from 'redis';
import * as connectRedis from 'connect-redis';
import * as passport from 'passport';
import { INestApplication } from '@nestjs/common';
import { Config } from './config';

export function addSessionMiddleware(app: INestApplication): void {
    const RedisStore = connectRedis(session);
    const client = redis.createClient({ url: Config.redisUrl });

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
