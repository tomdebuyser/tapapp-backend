import { Category } from './category.entity';
import { CategorySorting } from './category-sorting.entity';
import { Order, OrderItem } from './order.entity';
import { Organisation } from './organisation.entity';
import { Product } from './product.entity';
import { ProductSorting } from './product-sorting.entity';
import { User } from './user.entity';

export * from './category.entity';
export * from './category-sorting.entity';
export * from './order.entity';
export * from './organisation.entity';
export * from './product.entity';
export * from './product-sorting.entity';
export * from './user.entity';
export const entities = [
    Category,
    CategorySorting,
    Order,
    OrderItem,
    Organisation,
    Product,
    ProductSorting,
    User,
];
