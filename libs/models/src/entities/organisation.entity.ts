import { Entity, Column, DeepPartial, OneToMany } from 'typeorm';
import { plainToClass } from 'class-transformer';
import { v4 as uuid } from 'uuid';

import { AuditedEntity } from './audited.entity';
import { User } from './user.entity';

export enum OrganisationType {
    SuperAdmin = 'SUPER_ADMIN',
    Admin = 'ADMIN',
    Organisation = 'USER',
}

@Entity()
export class Organisation extends AuditedEntity {
    @Column({ unique: true })
    name: string;

    @Column({ default: true })
    isActive: boolean;

    /**
     * Creates a Organisation instance with given fields.
     * Auto-generated fields (id, dates, ...) are NOT filled in automatically by this method.
     */
    static create(fields: DeepPartial<Organisation>): Organisation {
        return plainToClass(Organisation, { id: uuid(), ...fields });
    }
}
