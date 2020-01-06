import { Entity, Column } from 'typeorm';

import { BaseEntity } from './base.entity';
import { UserState } from '../../_shared/constants';

@Entity()
export class User extends BaseEntity {
    @Column({ unique: true })
    email: string;

    /**
     * Defaults to REGISTERING when not given.
     */
    @Column({ enum: UserState, default: UserState.Registering, type: 'enum' })
    state: UserState;

    @Column({ nullable: true })
    password?: string;

    @Column({ nullable: true })
    resetToken?: string;

    // TODO: Add user role
    // TODO: Add createdBy field to show which admin invited the user
}
