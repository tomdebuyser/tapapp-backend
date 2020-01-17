import { BadRequestException, ForbiddenException } from '@nestjs/common';

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

export class AccountNotActive extends ForbiddenException {
    constructor() {
        super(
            'Login is not possible because your account is not active',
            'ACCOUNT_NOT_ACTIVE',
        );
    }
}
