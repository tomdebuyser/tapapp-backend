import { BadRequestException, MethodNotAllowedException } from '@nestjs/common';

export class ResetTokenInvalid extends BadRequestException {
    constructor() {
        super('The given resetToken is not valid', 'RESET_TOKEN_INVALID');
    }
}

export class ResetTokenExpired extends BadRequestException {
    constructor() {
        super('The given resetToken is expired', 'RESET_TOKEN_EXPIRED');
    }
}

export class InvalidOldPassword extends BadRequestException {
    constructor() {
        super(
            'The password you entered is not your current password',
            'INVALID_OLD_PASSWORD',
        );
    }
}

export class UserStateNotAllowed extends MethodNotAllowedException {
    constructor() {
        super('Action not allowed for this user', 'USER_STATE_NOT_ALLOWED');
    }
}
