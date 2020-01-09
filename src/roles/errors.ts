import { BadRequestException } from '@nestjs/common';

export class RoleNameAlreadyInUse extends BadRequestException {
    constructor() {
        super(
            'A role with this name already exists',
            'ROLE_NAME_ALREADY_IN_USE',
        );
    }
}
