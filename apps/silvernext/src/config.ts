import { config } from 'dotenv-safe';
import { join } from 'path';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

import { LoggerConfig, LogLevel } from '@libs/logger';
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

type JwtOptions = {
    secret: string;
};

type SessionOptions = {
    secret: string;
    expiresIn: number;
};

type ApiOptions = {
    rateLimit: number;
    swaggerPath: string;
    port: string;
    allowedOrigins: string[];
};

type ClusteringConfig = {
    // Specifies the number of cluster (worker) processes.
    workers?: number;
    // Specifies memory requirement per worker process, default is 512 MB.
    memory?: number;
};

class Config {
    static get sentryDsn(): string {
        return process.env.SENTRY_DSN;
    }

    static get environment(): Environment {
        return environment as Environment;
    }

    static get brandName(): string {
        return process.env.BRAND_NAME;
    }

    static get api(): ApiOptions {
        const DEFAULT_PORT = '3001';
        return {
            rateLimit: parseInt(process.env.REQUESTS_PER_MINUTE, 10),
            swaggerPath: process.env.SWAGGER_PATH,
            port: process.env.PORT || DEFAULT_PORT,
            allowedOrigins: process.env.ALLOWED_ORIGINS.split(',').filter(
                origin => !!origin,
            ),
        };
    }

    static get models(): TypeOrmModuleOptions {
        const sslRequired = ![Environment.Local, Environment.Test].includes(
            environment,
        );
        return {
            type: 'postgres',
            url: process.env.DATABASE_URL,
            synchronize: false,
            keepConnectionAlive: true,
            ssl: sslRequired,
            cache: {
                type: 'redis',
                options: process.env.REDIS_URL,
            },
            extra: {
                ssl: sslRequired ? { rejectUnauthorized: false } : false,
            },
        };
    }

    static get jwt(): JwtOptions {
        return {
            secret: process.env.JWT_SECRET,
        };
    }

    static get mailing(): MailerConfig {
        return {
            environment,
            mandrillApiKey: process.env.MANDRILL_API_KEY,
            mailFrom: process.env.MAIL_FROM,
            brandName: Config.brandName,
            frontendUrl: process.env.FRONTEND_URL,
        };
    }

    static get redisUrl(): string {
        return process.env.REDIS_URL;
    }

    static get session(): SessionOptions {
        return {
            secret: process.env.SESSION_SECRET,
            expiresIn: parseInt(process.env.SESSION_TTL, 10),
        };
    }

    static get logging(): LoggerConfig {
        return {
            environment,
            databaseLogLevel: process.env.DATABASE_LOG_LEVEL as LogLevel,
            logLevel: process.env.LOG_LEVEL as LogLevel,
            enableTraceId: true,
        };
    }

    static get clustering(): ClusteringConfig {
        return {
            workers: parseInt(process.env.WEB_CONCURRENCY, 10),
            memory: parseInt(process.env.WEB_MEMORY, 10),
        };
    }
}

export { Config };
