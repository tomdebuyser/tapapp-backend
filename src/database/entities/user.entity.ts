import { Entity, Column } from 'typeorm';

import { BaseEntity } from './base.entity';

enum UserState {
    Registering = 'REGISTERING',
    Active = 'ACTIVE',
}

@Entity()
export class User extends BaseEntity {
    @Column({ unique: true })
    email: string;

    @Column({ enum: UserState, default: UserState.Registering, type: 'enum' })
    state: UserState;

    @Column({ nullable: true })
    password?: string;

    @Column({ nullable: true })
    resetToken?: string;

    /**
     * Token used to complete the registration flow, allowing an account to select a password.
     */
    @Column({ nullable: true })
    registerToken?: string;

    /**
     * Email of the admin that initially created a given account.
     */
    @Column()
    createdBy: string;
}
