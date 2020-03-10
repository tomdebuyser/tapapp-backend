import { DynamicModule } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';

import { UserRepository, RoleRepository } from './repositories';
import { User, Role } from './entities';

export class DatabaseModule {
    static register(config: TypeOrmModuleOptions): DynamicModule {
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
