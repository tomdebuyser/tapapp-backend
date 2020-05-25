import { INestApplication } from '@nestjs/common';
import * as session from 'express-session';
import * as redis from 'redis';
import * as connectRedis from 'connect-redis';

import { LoggerService } from '@libs/logger';
import { Config } from './config';

const RedisStore = connectRedis(session);
// Due to conflicting types in connect-redis and redis, we have to type as any here to compile
const client: any = redis.createClient({ url: Config.redisUrl });

export function addSessionMiddleware(app: INestApplication): void {
    app.use(
        session({
            secret: Config.session.secret,
            resave: true,
            saveUninitialized: false,
            cookie: {
                maxAge: Config.session.expiresIn,
                secure: 'auto',
                httpOnly: true,
            },
            store: new RedisStore({ client }),
        }),
    );

    // Be sure redis errors are logged
    const logger = app.get(LoggerService);
    client.on('error', logger.error);
}
