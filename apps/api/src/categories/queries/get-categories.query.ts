import { Injectable } from '@nestjs/common';

import {
    CategoryRepository,
    CategorySortingRepository,
    ProductSortingRepository,
} from '@libs/models';
import { IHandler } from '@libs/common';
import { CategoryResponse } from '../dto';
import { UserSession } from '../../shared/constants';

type GetCategoriesQuery = {
    userSession: UserSession;
};

@Injectable()
export class GetCategoriesHandler implements IHandler<GetCategoriesQuery> {
    constructor(
        private readonly categoryRepository: CategoryRepository,
        private readonly categorySortingRepository: CategorySortingRepository,
        private readonly productSortingRepository: ProductSortingRepository,
    ) {}

    async execute({
        userSession,
    }: GetCategoriesQuery): Promise<CategoryResponse[]> {
        const { organisation } = userSession;

        // Get all the categories
        const categories = await this.categoryRepository
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
            .andWhere('product.isActive = :isActive', { isActive: true })
            .getMany();

        // Get the sorting of the categories
        const categorySorting = await this.categorySortingRepository.findOne({
            where: { organisation: { id: organisation.id } },
        });

        // Get the sorting of the products
        const productsSorting = await this.productSortingRepository.find({
            where: { organisation: { id: organisation.id } },
            relations: ['category'],
        });

        // Return the sorted categories and products
        const categoryIds =
            categorySorting.categoryIds ||
            categories.map(category => category.id);
        return categories
            .map(category => {
                const productIds = productsSorting.find(
                    sorting => sorting.category.id === category.id,
                )?.productIds;
                if (!productIds) return category;
                return {
                    ...category,
                    products: category.products.sort(
                        (p1, p2) =>
                            productIds.indexOf(p1.id) -
                            productIds.indexOf(p2.id),
                    ),
                };
            })
            .sort(
                (c1, c2) =>
                    categoryIds.indexOf(c1.id) - categoryIds.indexOf(c2.id),
            );
    }
}
