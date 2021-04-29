import { OrganisationRepository } from './organisation.repository';
import { ProductRepository } from './product.repository';
import { UserRepository } from './user.repository';

export * from './organisation.repository';
export * from './product.repository';
export * from './user.repository';
export const repositories = [
    OrganisationRepository,
    ProductRepository,
    UserRepository,
];
