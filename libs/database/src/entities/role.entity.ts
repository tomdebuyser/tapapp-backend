import { Entity, Column } from 'typeorm';

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
}
