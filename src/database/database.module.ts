import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserRepository, RoleRepository } from './repositories';
import { User, Role } from './entities';
import { Config } from '../config';

@Module({
    imports: [
        TypeOrmModule.forRoot({
            ...Config.database,
            entities: [Role, User],
        }),
        TypeOrmModule.forFeature([RoleRepository, UserRepository]),
    ],
    exports: [TypeOrmModule],
})
export class DatabaseModule {}
