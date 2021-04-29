import {
    BadRequestException,
    NotFoundException,
    MethodNotAllowedException,
} from '@nestjs/common';

export class EmailAlreadyInUse extends BadRequestException {
    constructor() {
        super('A user with this email already exists', 'EMAIL_ALREADY_IN_USE');
    }
}

export class UserNotFound extends NotFoundException {
    constructor() {
        super('The given user was not found', 'USER_NOT_FOUND');
    }
}

export class CannotDeleteCurrentUser extends BadRequestException {
    constructor() {
        super(
            'Cannot delete the current logged in user',
            'CANNOT_DELETE_CURRENT_USER',
        );
    }
}

export class AccountAlreadyActive extends MethodNotAllowedException {
    constructor() {
        super(
            'The given user already has an active acount',
            'ACCOUNT_ALREADY_ACTIVE',
        );
    }
}
