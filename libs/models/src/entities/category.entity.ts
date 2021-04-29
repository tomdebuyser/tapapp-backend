import {
    Entity,
    Column,
    DeepPartial,
    ManyToOne,
    ManyToMany,
    JoinTable,
} from 'typeorm';
import { plainToClass } from 'class-transformer';
import { v4 as uuid } from 'uuid';

import { AuditedEntity } from './audited.entity';
import { Product } from './product.entity';
import { Organisation } from './organisation.entity';

@Entity()
export class Category extends AuditedEntity {
    @Column()
    name: string;

    /** Relations */

    @ManyToOne(() => Organisation)
    organisation: Organisation;

    @ManyToMany(() => Product)
    @JoinTable()
    products: Product[];

    /**
     * Creates a Category instance with given fields.
     * Auto-generated fields (id, dates, ...) are NOT filled in automatically by this method.
     */
    static create(fields: DeepPartial<Category>): Category {
        return plainToClass(Category, { id: uuid(), ...fields });
    }
}
