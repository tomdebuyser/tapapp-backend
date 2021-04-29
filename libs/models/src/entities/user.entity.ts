import { Entity, Column, DeepPartial, ManyToOne } from 'typeorm';
import { plainToClass } from 'class-transformer';
import { v4 as uuid } from 'uuid';

import { AuditedEntity } from './audited.entity';
import { Organisation } from './organisation.entity';

export enum UserType {
    SuperAdmin = 'SUPER_ADMIN',
    Admin = 'ADMIN',
    User = 'USER',
}

@Entity()
export class User extends AuditedEntity {
    @Column({ unique: true })
    email: string;

    @Column({ enum: UserType, default: UserType.User, type: 'enum' })
    type: UserType;

    @Column({ default: true })
    isActive: boolean;

    @Column()
    name: string;

    @Column()
    password: string;

    @ManyToOne(() => Organisation)
    organisation: Organisation;

    /**
     * Creates a User instance with given fields.
     * Auto-generated fields (id, dates, ...) are NOT filled in automatically by this method.
     */
    static create(fields: DeepPartial<User>): User {
        return plainToClass(User, { id: uuid(), ...fields });
    }
}
