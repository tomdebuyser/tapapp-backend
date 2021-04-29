import { CategoryRepository } from './category.repository';
import { CategorySortingRepository } from './category-sorting.repository';
import { OrganisationRepository } from './organisation.repository';
import { ProductRepository } from './product.repository';
import { ProductSortingRepository } from './product-sorting.repository';
import { UserRepository } from './user.repository';

export * from './category.repository';
export * from './category-sorting.repository';
export * from './organisation.repository';
export * from './product.repository';
export * from './product-sorting.repository';
export * from './user.repository';
export const repositories = [
    CategoryRepository,
    CategorySortingRepository,
    OrganisationRepository,
    ProductRepository,
    ProductSortingRepository,
    UserRepository,
];
