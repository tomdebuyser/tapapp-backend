import { Module } from '@nestjs/common';

import { SharedModule } from '../shared/shared.module';
import { CategoriesController } from './categories.controller';
import { GetCategoriesHandler } from './queries';

@Module({
    imports: [SharedModule],
    controllers: [CategoriesController],
    providers: [GetCategoriesHandler],
})
export class CategoriesModule {}
