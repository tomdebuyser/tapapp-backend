import { Entity, Column, ManyToMany, JoinTable, DeepPartial } from 'typeorm';
import { plainToClass } from 'class-transformer';
import { v4 as uuid } from 'uuid';

import { Role } from './role.entity';
import { AuditedEntity } from './audited.entity';

export enum UserState {
    Registering = 'REGISTERING',
    Active = 'ACTIVE',
    Inactive = 'INACTIVE',
}

@Entity()
export class User extends AuditedEntity {
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
        return plainToClass(User, { id: uuid(), ...fields });
    }
}
