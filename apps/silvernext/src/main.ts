import { NestFactory } from '@nestjs/core';
import {
    INestApplication,
    ValidationPipe,
    NestApplicationOptions,
    BadRequestException,
} from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { init as initSentry, Handlers } from '@sentry/node';
import * as helmet from 'helmet';
import * as compression from 'compression';
import * as rateLimit from 'express-rate-limit';
import * as redisStore from 'rate-limit-redis';

import { Environment } from '@libs/common';
import { AppModule } from './app.module';
import { Config } from './config';
import { addSessionMiddleware } from './session.middleware';
import { LoggerService } from '@libs/logger';

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
    const app = await NestFactory.create(AppModule, getAppOptions());
    const logger = app.get(LoggerService);

    app.setGlobalPrefix(API_PREFIX);

    if (needsErrorLogging) {
        addSentryInit(app);
    }

    addSwaggerDocs(app, logger);
    addGlobalMiddleware(app);
    addSessionMiddleware(app);

    if (needsErrorLogging) {
        addSentryErrorHandler(app);
    }

    await app.listen(Config.api.port);
    logger.log(`App running on port [${Config.api.port}]`, {
        context,
    });
}

function addSwaggerDocs(app: INestApplication, logger: LoggerService): void {
    const options = new DocumentBuilder()
        .setTitle(Config.brandName)
        .setDescription('Swagger documentation')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, options);
    const fullSwaggerPath = `${API_PREFIX}/${Config.api.swaggerPath}`;
    SwaggerModule.setup(fullSwaggerPath, app, document);

    logger.log(`Swagger running at [${fullSwaggerPath}]`, { context });
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

function getAppOptions(): NestApplicationOptions {
    // On remote prod-like environments, we want to limit the default logger, so we don't pollute our own logs
    return isProductionLikeEnvironment
        ? { logger: ['warn', 'error', 'log'] }
        : {};
}

bootstrap();
