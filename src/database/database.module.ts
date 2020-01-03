import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserRepository } from './repositories';
import { User } from './entities';
import { Config } from '../config';

@Module({
    imports: [
        TypeOrmModule.forRoot({
            ...Config.database,
            entities: [User],
        }),
        TypeOrmModule.forFeature([UserRepository]),
    ],
    exports: [TypeOrmModule],
})
export class DatabaseModule {}
