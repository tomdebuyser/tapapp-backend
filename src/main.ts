import { NestFactory } from '@nestjs/core';
import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import config from './config';

async function bootstrap(): Promise<void> {
    const app = await NestFactory.create(AppModule);

    setupSwagger(app);

    await app.listen(config.port);
}

function setupSwagger(app: INestApplication): void {
    const options = new DocumentBuilder()
        .setTitle(config.projectName)
        .setDescription('Swagger documentation')
        .setVersion('1.0')
        .build();
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup(config.swaggerPath, app, document);
}

bootstrap();
