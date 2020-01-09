import { BadRequestException } from '@nestjs/common';

export class EmailAlreadyInUse extends BadRequestException {
    constructor() {
        super('A user with this email already exists', 'EMAIL_ALREADY_IN_USE');
    }
}

export class RoleNotFound extends BadRequestException {
    constructor() {
        super('One of the roles passed was not found', 'ROLE_NOT_FOUND');
    }
}
