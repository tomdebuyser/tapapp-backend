import {
    PrimaryColumn,
    CreateDateColumn,
    UpdateDateColumn,
    Column,
} from 'typeorm';

/**
 * Base fields for audited entity:
 * - Database managed timestamps created and updated at
 * - Primary key (uuid)
 * - Created by and updated by fields, not managed by database, to be filled in
 */
export abstract class AuditedEntity {
    @PrimaryColumn({ default: () => 'uuid_generate_v4()', type: 'uuid' })
    id: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column({ nullable: true })
    createdBy?: string;

    @Column({ nullable: true })
    updatedBy?: string;
}
