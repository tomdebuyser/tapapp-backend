import { Entity, Column, DeepPartial } from 'typeorm';
import { plainToClass } from 'class-transformer';
import { mergeDeepLeft } from 'ramda';

import { BaseEntity } from './base.entity';

export class Permissions {
    roles: RolePermissions;
    users: UserPermissions;
}

class RolePermissions {
    view: boolean;
    edit: boolean;
}

class UserPermissions {
    view: boolean;
    edit: boolean;
}

@Entity()
export class Role extends BaseEntity {
    @Column({ unique: true })
    name: string;

    /**
     * Keep the permissions as a json file
     */
    @Column({ type: 'json' })
    permissions: Permissions;

    /**
     * Creates a Role instance with given fields.
     * Auto-generated fields (id, dates, ...) are NOT filled in automatically by this method.
     */
    static create(fields: DeepPartial<Role>): Role {
        return plainToClass(Role, mergeDeepLeft(fields, new Role()));
    }
}
