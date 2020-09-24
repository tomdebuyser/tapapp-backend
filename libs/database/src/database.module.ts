import { DynamicModule } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';

import { LoggerService, TypeormLoggerProxy } from '@libs/logger';
import { UserRepository, RoleRepository } from './repositories';
import { User, Role } from './entities';

export class DatabaseModule {
    static register(config: TypeOrmModuleOptions): DynamicModule {
        return {
            module: DatabaseModule,
            imports: [
                TypeOrmModule.forRootAsync({
                    inject: [LoggerService],
                    useFactory: async (logger: LoggerService) => ({
                        ...config,
                        entities: [Role, User],
                        logger: new TypeormLoggerProxy(logger),
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
    static registerTest(config: TypeOrmModuleOptions): DynamicModule {
        return {
            module: DatabaseModule,
            imports: [
                TypeOrmModule.forRoot({
                    ...config,
                    entities: [Role, User],
                }),
                TypeOrmModule.forFeature([RoleRepository, UserRepository]),
            ],
            exports: [TypeOrmModule],
        };
    }
}
