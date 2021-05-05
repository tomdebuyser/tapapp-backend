import { InternalServerErrorException } from '@nestjs/common';

export class FetchPaymentFailed extends InternalServerErrorException {
    constructor() {
        super(
            'FETCH_PAYMENT_FAILED',
            'Something went wrong at fetching payment with Payconiq.',
        );
    }
}

export class CreatePaymentFailed extends InternalServerErrorException {
    constructor() {
        super(
            'CREATE_PAYMENT_FAILED',
            'Something went wrong at creating a new payment with Payconiq.',
        );
    }
}

export class CancelPaymentFailed extends InternalServerErrorException {
    constructor() {
        super(
            'CANCEL_PAYMENT_FAILED',
            'Something went wrong at cancelling a payment with Payconiq.',
        );
    }
}
