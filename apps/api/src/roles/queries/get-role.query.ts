import { Injectable } from '@nestjs/common';

import { RoleRepository } from '@libs/models';
import { RoleIdParam, RoleResponse } from '../dto';
import { IHandler } from '@libs/common';

export type GetRoleQuery = {
    data: RoleIdParam;
};

@Injectable()
export class GetRoleHandler implements IHandler<GetRoleQuery> {
    constructor(private readonly roleRepository: RoleRepository) {}

    execute({ data }: GetRoleQuery): Promise<RoleResponse> {
        return this.roleRepository
            .createQueryBuilder('role')
            .select('role')
            .where('role.id = :roleId', { roleId: data.roleId })
            .getOne();
    }
}
