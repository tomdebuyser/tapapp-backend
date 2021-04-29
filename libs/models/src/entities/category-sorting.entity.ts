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

@Entity()
export class CategorySorting {
    @PrimaryColumn({ default: () => 'uuid_generate_v4()', type: 'uuid' })
    id: string;

    @ManyToOne(() => Organisation)
    @JoinColumn()
    organisation: Organisation;

    /**
     * This array represents an ordered list of ids of the categories within an organisation.
     */
    @Column({ type: 'jsonb', default: '[]' })
    categoryIds: string[];

    /**
     * Creates a CategorySorting instance with given fields.
     * Auto-generated fields (id, dates, ...) are NOT filled in automatically by this method.
     */
    static create(fields: DeepPartial<CategorySorting>): CategorySorting {
        return plainToClass(CategorySorting, { id: uuid(), ...fields });
    }
}
