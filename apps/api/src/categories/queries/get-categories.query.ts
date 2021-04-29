import { Injectable } from '@nestjs/common';

import { CategoryRepository } from '@libs/models';
import { IHandler } from '@libs/common';
import { CategoryResponse } from '../dto';
import { UserSession } from '../../shared/constants';

type GetCategoriesQuery = {
    userSession: UserSession;
};

@Injectable()
export class GetCategoriesHandler implements IHandler<GetCategoriesQuery> {
    constructor(private readonly categoryRepository: CategoryRepository) {}

    async execute({
        userSession,
    }: GetCategoriesQuery): Promise<CategoryResponse[]> {
        const { organisation } = userSession;

        return this.categoryRepository
            .createQueryBuilder('category')
            .select([
                'category.id',
                'category.name',
                'product.id',
                'product.logo',
                'product.name',
                'product.price',
            ])
            .innerJoin('category.products', 'product')
            .where('category.organisationId = :organisationId', {
                organisationId: organisation.id,
            })
            .getMany();
    }
}
