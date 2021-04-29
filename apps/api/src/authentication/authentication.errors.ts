import { MethodNotAllowedException } from '@nestjs/common';

export class UserNotActive extends MethodNotAllowedException {
    constructor() {
        super(
            'Action not allowed for this user as the user is not active',
            'USER_NOT_ACTIVE',
        );
    }
}
