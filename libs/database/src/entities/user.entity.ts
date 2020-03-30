import { Entity, Column, ManyToMany, JoinTable, DeepPartial } from 'typeorm';
import { mergeDeepLeft } from 'ramda';
import { plainToClass } from 'class-transformer';

import { BaseEntity } from './base.entity';
import { Role } from './role.entity';

export enum UserState {
    Registering = 'REGISTERING',
    Active = 'ACTIVE',
    Inactive = 'INACTIVE',
}

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
    firstName?: string;

    @Column({ nullable: true })
    lastName?: string;

    @Column({ nullable: true })
    password?: string;

    @Column({ nullable: true })
    resetToken?: string;

    @ManyToMany(() => Role)
    @JoinTable()
    roles: Role[];

    /**
     * Creates a User instance with given fields.
     * Auto-generated fields (id, dates, ...) are NOT filled in automatically by this method.
     */
    static create(fields: DeepPartial<User>): User {
        return plainToClass(User, mergeDeepLeft(fields, new User()));
    }
}
