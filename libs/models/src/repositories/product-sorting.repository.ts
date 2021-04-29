import { EntityRepository, Repository } from 'typeorm';

import { ProductSorting } from '../entities';

@EntityRepository(ProductSorting)
export class ProductSortingRepository extends Repository<ProductSorting> {}
