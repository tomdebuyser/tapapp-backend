import { Entity, Column, DeepPartial, PrimaryColumn } from 'typeorm';
import { plainToClass } from 'class-transformer';
import { v4 as uuid } from 'uuid';

@Entity()
export class ProductSorting {
    @PrimaryColumn({ default: () => 'uuid_generate_v4()', type: 'uuid' })
    id: string;

    /**
     * We do not model this as a relation because we have no benefit of selecting other properties than the id when selecting this entity.
     */
    @Column()
    organisationId: string;

    /**
     * We do not model this as a relation because we have no benefit of selecting other properties than the id when selecting this entity.
     */
    @Column()
    categoryId: string;

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
