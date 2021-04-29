import { EntityRepository, Repository } from 'typeorm';

import { CategorySorting } from '../entities';

@EntityRepository(CategorySorting)
export class CategorySortingRepository extends Repository<CategorySorting> {}
