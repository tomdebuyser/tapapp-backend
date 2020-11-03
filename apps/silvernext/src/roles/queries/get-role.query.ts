import { Injectable } from '@nestjs/common';

import { RoleRepository } from '@libs/models';
import { RoleResponse } from '../dto';

@Injectable()
export class GetRoleHandler {
    constructor(private readonly roleRepository: RoleRepository) {}

    execute(roleId: string): Promise<RoleResponse> {
        return this.roleRepository
            .createQueryBuilder('role')
            .select('role')
            .where('role.id = :roleId', { roleId })
            .getOne();
    }
}
