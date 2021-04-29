import { Organisation } from './organisation.entity';
import { Product } from './product.entity';
import { User } from './user.entity';

export * from './organisation.entity';
export * from './product.entity';
export * from './user.entity';
export const entities = [Organisation, Product, User];
