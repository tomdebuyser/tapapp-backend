import { BadRequestException, NotFoundException } from '@nestjs/common';

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

export class UserNotFound extends NotFoundException {
    constructor() {
        super('The given user was not found', 'USER_NOT_FOUND');
    }
}

export class AccountAlreadyActive extends BadRequestException {
    constructor() {
        super(
            'The given user already has an active acount',
            'ACCOUNT_ALREADY_ACTIVE',
        );
    }
}
