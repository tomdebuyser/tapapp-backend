import {
    Entity,
    Column,
    DeepPartial,
    PrimaryColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { plainToClass } from 'class-transformer';
import { v4 as uuid } from 'uuid';

import { Organisation } from './organisation.entity';
import { Category } from './category.entity';

@Entity()
export class ProductSorting {
    @PrimaryColumn({ default: () => 'uuid_generate_v4()', type: 'uuid' })
    id: string;

    @ManyToOne(() => Organisation)
    @JoinColumn()
    organisation: Organisation;

    @ManyToOne(() => Category)
    @JoinColumn()
    category: Category;

    /**
     * This array represents an ordered list of ids of the products within a caterogy of an organisation.
     */
    @Column({ type: 'jsonb', default: '[]' })
    productIds: string[];

    /**
     * Creates a ProductSorting instance with given fields.
     * Auto-generated fields (id, dates, ...) are NOT filled in automatically by this method.
     */
    static create(fields: DeepPartial<ProductSorting>): ProductSorting {
        return plainToClass(ProductSorting, { id: uuid(), ...fields });
    }
}
