import { BadRequestException } from '@nestjs/common';

export class EmailAlreadyInUse extends BadRequestException {
    constructor() {
        super('A user with this email already exists', 'EMAIL_ALREADY_IN_USER');
    }
}
