import {
    NotFoundException,
    BadRequestException,
    MethodNotAllowedException,
} from '@nestjs/common';

export class OrderItemProductNotFoundException extends NotFoundException {
    constructor() {
        super(
            'One of the given order items contains a product that was not found',
            'ORDER_ITEM_PRODUCT_NOT_FOUND',
        );
    }
}

export class OrderItemProductNotActiveException extends BadRequestException {
    constructor() {
        super(
            'One of the given order items contains a product that is not active',
            'ORDER_ITEM_PRODUCT_NOT_ACTIVE',
        );
    }
}

export class OrderClientNameAlreadyInUseException extends BadRequestException {
    constructor() {
        super(
            'An unfinshed order with this client name already exists',
            'ORDER_CLIENT_NAME_ALREADY_IN_USE',
        );
    }
}

export class OrderAlreadyFinishedException extends MethodNotAllowedException {
    constructor() {
        super(
            'The requested operation is not allowed as the order is already finished',
            'ORDER_ALREADY_FINISHED',
        );
    }
}
