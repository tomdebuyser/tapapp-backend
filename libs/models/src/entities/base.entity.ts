import { PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * Base fields for each entity:
 * - Database managed timestamps created and updated at
 * - Primary key (uuid)
 */
export abstract class BaseEntity {
    @PrimaryColumn({ default: () => 'uuid_generate_v4()', type: 'uuid' })
    id: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
