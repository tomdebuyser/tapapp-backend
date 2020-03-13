import { NestFactory } from '@nestjs/core';
import {
    INestApplication,
    ValidationPipe,
    NestApplicationOptions,
} from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { init as initSentry, Handlers } from '@sentry/node';
import * as helmet from 'helmet';
import * as compression from 'compression';
import * as rateLimit from 'express-rate-limit';

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

async function bootstrap(): Promise<void> {
    const app = await NestFactory.create(AppModule, getAppOptions());
    const logger = app.get(LoggerService);

    app.setGlobalPrefix('api');

    if (needsErrorLogging) {
        addSentryInit(app);
    }

    addSwaggerDocs(app);
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

function addSwaggerDocs(app: INestApplication): void {
    const options = new DocumentBuilder()
        .setTitle(Config.brandName)
        .setDescription('Swagger documentation')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup(Config.api.swaggerPath, app, document);
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
        }),
    );
    app.use(helmet());
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            transform: true,
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
