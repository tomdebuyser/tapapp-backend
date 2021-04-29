import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { UserSession } from '../shared/constants';
import { GetUserSession } from '../shared/decorators';
import { AuthenticatedGuard } from '../shared/guards';
import { CategoryResponse } from './dto';
import { GetCategoriesHandler } from './queries';

@ApiBearerAuth()
@UseGuards(AuthenticatedGuard)
@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
    constructor(private readonly getCategoriesHandler: GetCategoriesHandler) {}

    @Get()
    getCategories(
        @GetUserSession() userSession: UserSession,
    ): Promise<CategoryResponse[]> {
        return this.getCategoriesHandler.execute({
            userSession,
        });
    }
}
