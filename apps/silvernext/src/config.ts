import { config } from 'dotenv-safe';
import { join } from 'path';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { LogLevel } from '@nestjs/common';
import { LoggerOptions } from 'typeorm/logger/LoggerOptions';

import { LoggerConfig } from '@libs/logger';
import { MailerConfig } from '@libs/mailer';
import { Environment } from '@libs/common';

const environment = process.env.NODE_ENV as Environment;
function assertNodeEnv(env: string | undefined): asserts env {
    if (!env) {
        throw Error('NODE ENV must be specified');
    }
}

assertNodeEnv(environment);

const environmentsWithEnvFiles = [Environment.Local, Environment.Test];
if (environmentsWithEnvFiles.includes(environment)) {
    const envFiles = {
        example: join(__dirname, '.env.example'),
        test: join(__dirname, '.env.local'),
        local: join(__dirname, '.env.local'),
    };

    config({
        path: envFiles[environment] || envFiles.local,
        example: envFiles.example,
    });
}

interface IJwtOptions {
    secret: string;
    expiresIn: string;
}

interface ISessionOptions {
    secret: string;
    expiresIn: number;
}

interface IApiOptions {
    rateLimit: number;
    swaggerPath: string;
    port: string;
    allowedOrigins: string[];
}

class Config {
    static get sentryDsn(): string {
        return process.env.SENTRY_DSN as string;
    }

    static get environment(): Environment {
        return environment as Environment;
    }

    static get brandName(): string {
        return process.env.BRAND_NAME as string;
    }

    static get api(): IApiOptions {
        return {
            rateLimit: parseInt(process.env.REQUESTS_PER_MINUTE as string, 10),
            swaggerPath: process.env.SWAGGER_PATH as string,
            port: process.env.PORT as string,
            allowedOrigins: process.env.ALLOWED_ORIGINS.split(',').filter(
                origin => !!origin,
            ),
        };
    }

    static get database(): TypeOrmModuleOptions {
        return {
            type: 'postgres',
            url: process.env.DATABASE_URL,
            synchronize: false,
            keepConnectionAlive: true,
            logging: process.env.DATABASE_LOGGING as LoggerOptions,
            ssl: process.env.DATABASE_SSL === 'true',
        };
    }

    static get jwt(): IJwtOptions {
        return {
            secret: process.env.JWT_SECRET as string,
            expiresIn: process.env.JWT_EXPIRATION_TIME as string,
        };
    }

    static get mailing(): MailerConfig {
        return {
            environment: process.env.NODE_ENV as Environment,
            mandrillApiKey: process.env.MANDRILL_API_KEY as string,
            mailFrom: process.env.MAIL_FROM as string,
        };
    }

    static get redisUrl(): string {
        return process.env.REDIS_URL as string;
    }

    static get session(): ISessionOptions {
        return {
            secret: process.env.SESSION_SECRET as string,
            expiresIn: parseInt(process.env.SESSION_TTL as string),
        };
    }

    static get logging(): LoggerConfig {
        return {
            environment: process.env.NODE_ENV as Environment,
            logLevel: process.env.LOG_LEVEL as LogLevel,
        };
    }
}

export { Config };
