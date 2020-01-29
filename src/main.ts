import { NestFactory } from '@nestjs/core';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { init as initSentry, Handlers } from '@sentry/node';
import * as helmet from 'helmet';
import * as compression from 'compression';
import * as rateLimit from 'express-rate-limit';

import { AppModule } from './app.module';
import { Config } from './config';
import { addSessionMiddleware } from './session.middleware';

const environmentsWithErrorLogging = ['production', 'staging'];
const needsErrorLogging =
    Config.sentryDsn &&
    environmentsWithErrorLogging.includes(Config.environment);

async function bootstrap(): Promise<void> {
    const app = await NestFactory.create(AppModule);

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

    await app.listen(Config.port);
}

function addSwaggerDocs(app: INestApplication): void {
    const options = new DocumentBuilder()
        .setTitle(Config.brandName)
        .setDescription('Swagger documentation')
        .setVersion('1.0')
        .build();
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup(Config.swaggerPath, app, document);
}

function addGlobalMiddleware(app: INestApplication): void {
    app.enableCors({
        origin: Config.allowedOrigins,
        methods: ['OPTIONS', 'HEAD', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        credentials: true,
    });
    app.use(
        rateLimit({
            max: Config.rateLimit,
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

bootstrap();
