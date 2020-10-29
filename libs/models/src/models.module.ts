import { DynamicModule } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';

import { LoggerConfig, LoggerService, TypeormLoggerProxy } from '@libs/logger';
import { UserRepository, RoleRepository } from './repositories';
import { User, Role } from './entities';

export class ModelsModule {
    static register(typeOrmConfig: TypeOrmModuleOptions): DynamicModule {
        return {
            module: ModelsModule,
            imports: [
                TypeOrmModule.forRootAsync({
                    inject: [LoggerService, LoggerConfig],
                    useFactory: async (
                        logger: LoggerService,
                        loggerConfig: LoggerConfig,
                    ) => ({
                        ...typeOrmConfig,
                        entities: [Role, User],
                        logger: new TypeormLoggerProxy(logger, loggerConfig),
                    }),
                }),
                TypeOrmModule.forFeature([RoleRepository, UserRepository]),
            ],
            providers: [TypeormLoggerProxy],
            exports: [TypeOrmModule],
        };
    }

    /**
     * Use this method to register a database module for an integration test.
     * The difference between this one and the regular `register` is that there is no
     * custom logger implementation.
     */
    static registerTest(typeOrmConfig: TypeOrmModuleOptions): DynamicModule {
        return {
            module: ModelsModule,
            imports: [
                TypeOrmModule.forRoot({
                    ...typeOrmConfig,
                    entities: [Role, User],
                }),
                TypeOrmModule.forFeature([RoleRepository, UserRepository]),
            ],
            exports: [TypeOrmModule],
        };
    }
}
