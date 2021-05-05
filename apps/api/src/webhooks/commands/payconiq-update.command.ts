import { Injectable, InternalServerErrorException } from '@nestjs/common';

import { IHandler } from '@libs/common';
import {
    PayconiqPaymentData,
    PayconiqService,
    paymentStatusFromPayconiqStatus,
} from '@libs/payconiq';
import {
    OrderRepository,
    PaymentRepository,
    PaymentStatus,
} from '@libs/models';

type PayconiqUpdateCommand = {
    data: PayconiqPaymentData;
};

@Injectable()
export class PayconiqUpdateHandler implements IHandler<PayconiqUpdateCommand> {
    constructor(
        private readonly payconiqService: PayconiqService,
        private readonly paymentRepository: PaymentRepository,
        private readonly orderRepository: OrderRepository,
    ) {}

    async execute({ data }: PayconiqUpdateCommand): Promise<void> {
        // Find the payment by the reference
        const paymentId = this.payconiqService.internalPaymentIdFromReference(
            data.reference,
        );
        const payment = await this.paymentRepository.findOneOrThrow(
            { id: paymentId },
            {
                relations: ['order'],
            },
            InternalServerErrorException, // It should throw a 500 in case of an error.
        );

        // Update the payment
        const status = paymentStatusFromPayconiqStatus(data.status);
        await this.paymentRepository.update(paymentId, {
            data,
            status,
        });

        // If succeeded, mark the associated order as finished
        if (status === PaymentStatus.SUCCEEDED) {
            await this.orderRepository.update(payment.order.id, {
                isFinished: true,
            });
        }
    }
}
