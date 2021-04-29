import { NestFactory } from '@nestjs/core';
import {
    INestApplication,
    ValidationPipe,
    BadRequestException,
} from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { init as initSentry, Handlers } from '@sentry/node';
import * as helmet from 'helmet';
import * as compression from 'compression';
import * as rateLimit from 'express-rate-limit';
import * as redisStore from 'rate-limit-redis';
import * as throng from 'throng';
import * as basicAuth from 'express-basic-auth';

import { Environment } from '@libs/common';
import { LoggerService, NestLoggerProxy } from '@libs/logger';
import { AppModule } from './app.module';
import { Config } from './config';
import { addSessionMiddleware } from './session.middleware';

const productionLikeEnvironments = [
    Environment.Production,
    Environment.Staging,
];
const isProductionLikeEnvironment = productionLikeEnvironments.includes(
    Config.environment,
);
const needsErrorLogging = Config.sentryDsn && isProductionLikeEnvironment;

const context = 'Bootstrap';
const API_PREFIX = 'api';

async function bootstrap(): Promise<void> {
    const app = await NestFactory.create(AppModule, { logger: false });
    const logger = app.get(LoggerService);
    logger.info('Successfully created nest app', { context });

    app.useLogger(new NestLoggerProxy(logger));
    app.setGlobalPrefix(API_PREFIX);

    if (needsErrorLogging) {
        logger.info('Initializing sentry', { context });
        addSentryInit(app);
    }

    if (!isProductionLikeEnvironment) {
        logger.info('Initializing swagger', { context });
        addSwaggerDocs(app, logger);
    }

    logger.info('Initializing middleware', { context });
    addGlobalMiddleware(app);
    addSessionMiddleware(app);

    if (needsErrorLogging) {
        addSentryErrorHandler(app);
    }

    await app.listen(Config.api.port);
    logger.info(`App running on port [${Config.api.port}]`, {
        context,
    });
}

function addSwaggerDocs(app: INestApplication, logger: LoggerService): void {
    const fullSwaggerPath = `${API_PREFIX}/docs`;
    const isLocalEnvironment = [Environment.Local, Environment.Test].includes(
        Config.environment,
    );

    if (!isLocalEnvironment) {
        app.use(
            `/${fullSwaggerPath}`,
            basicAuth({
                challenge: true,
                users: { [Config.swagger.username]: Config.swagger.password },
            }),
        );
    }

    const options = new DocumentBuilder()
        .setTitle(Config.brandName)
        .setDescription('Swagger documentation')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup(fullSwaggerPath, app, document, {
        swaggerOptions: { tagsSorter: 'alpha', operationsSorter: 'alpha' },
    });

    logger.info(`Swagger running at [${fullSwaggerPath}]`, { context });
}

function addGlobalMiddleware(app: INestApplication): void {
    app.enableCors({
        origin: Config.api.allowedOrigins,
        methods: ['OPTIONS', 'HEAD', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        credentials: true,
    });
    app.use(
        rateLimit({
            max: Config.api.rateLimit,
            store: new redisStore({ redisURL: Config.redisUrl }),
        }),
    );
    app.use(helmet());
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            transform: true,
            exceptionFactory: (errors): BadRequestException =>
                new BadRequestException(
                    errors.map(error => ({
                        children: error.children,
                        constraints: error.constraints,
                        property: error.property,
                    })),
                ),
        }),
    );
    app.use(compression());
}

function addSentryInit(app: INestApplication): void {
    initSentry({
        dsn: Config.sentryDsn,
        environment: Config.environment,
    });

    app.use(Handlers.requestHandler());
}

function addSentryErrorHandler(app: INestApplication): void {
    app.use(Handlers.errorHandler());
}

function run(): void {
    if (isProductionLikeEnvironment) {
        throng({
            workers: Config.clustering.workers,
            start: bootstrap,
            lifetime: Infinity,
        });
    } else {
        bootstrap();
    }
}

run();
