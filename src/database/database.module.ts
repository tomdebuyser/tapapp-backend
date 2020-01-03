import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// import {} from './repositories';
// import {} from './entities';
import { Config } from '../config';

@Module({
    imports: [
        TypeOrmModule.forRoot({
            ...Config.database,
            entities: [],
        }),
        TypeOrmModule.forFeature([]),
    ],
    exports: [TypeOrmModule],
})
export class DatabaseModule {}
