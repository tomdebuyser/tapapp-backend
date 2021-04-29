import { Entity, Column, DeepPartial, ManyToOne } from 'typeorm';
import { plainToClass } from 'class-transformer';
import { v4 as uuid } from 'uuid';

import { AuditedEntity } from './audited.entity';
import { Organisation } from './organisation.entity';

@Entity()
export class Product extends AuditedEntity {
    @Column()
    name: string;

    @Column()
    logo: string;

    /**
     * Price is specified in euro cents
     */
    @Column()
    price: number;

    @Column({ default: true })
    isActive: boolean;

    /**
     * This field represents the id of the product where this product is an update from.
     * We keep this information to be able to track product changes (e.g. price increase)
     * We do not model this as a relationship as this could give potential DB issues.
     */
    @Column({ nullable: true })
    predecessorId?: string;

    /** Relations */

    @ManyToOne(() => Organisation)
    organisation: Organisation;

    /**
     * Creates a Product instance with given fields.
     * Auto-generated fields (id, dates, ...) are NOT filled in automatically by this method.
     */
    static create(fields: DeepPartial<Product>): Product {
        return plainToClass(Product, { id: uuid(), ...fields });
    }
}
