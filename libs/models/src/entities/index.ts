import { Category } from './category.entity';
import { Organisation } from './organisation.entity';
import { Product } from './product.entity';
import { User } from './user.entity';

export * from './category.entity';
export * from './organisation.entity';
export * from './product.entity';
export * from './user.entity';
export const entities = [Category, Organisation, Product, User];
