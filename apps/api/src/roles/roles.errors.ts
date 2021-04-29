import {
    BadRequestException,
    NotFoundException,
    MethodNotAllowedException,
} from '@nestjs/common';

export class RoleNameAlreadyInUse extends BadRequestException {
    constructor() {
        super(
            'A role with this name already exists',
            'ROLE_NAME_ALREADY_IN_USE',
        );
    }
}

export class RoleNotFound extends NotFoundException {
    constructor() {
        super('The given role was not found', 'ROLE_NOT_FOUND');
    }
}

export class RoleInUse extends MethodNotAllowedException {
    constructor() {
        super(
            'It is not possible to delete a role that is being used',
            'ROLE_IN_USE',
        );
    }
}
