import { BadRequestException } from '@nestjs/common';

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
