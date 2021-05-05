import { Injectable } from '@nestjs/common';

import { LoggerService } from '@libs/logger';
import { IHandler } from '@libs/common';
import { UserSession } from '../../shared/constants';
import { PaymentIdParam } from '../dto';
import { PaymentRepository, PaymentStatus, PaymentType } from '@libs/models';
import { OrderAlreadyFinishedException } from '../../orders/orders.errors';
import { PayconiqPaymentData, PayconiqService } from '@libs/payconiq';

const context = 'CancelPayconiqPaymentHandler';

export type CancelPayconiqPaymentCommand = {
    userSession: UserSession;
    data: PaymentIdParam;
};

@Injectable()
export class CancelPayconiqPaymentHandler
    implements IHandler<CancelPayconiqPaymentCommand> {
    constructor(
        private readonly payconiqService: PayconiqService,
        private readonly paymentRepository: PaymentRepository,
        private readonly logger: LoggerService,
    ) {}

    async execute({
        userSession,
        data,
    }: CancelPayconiqPaymentCommand): Promise<void> {
        const { paymentId } = data;

        // Check if the payconiq payment exists
        const payment = await this.paymentRepository.findOneOrThrow(
            {
                id: paymentId,
                type: PaymentType.PAYCONIQ,
                organisation: { id: userSession.organisation.id },
            },
            { relations: ['order', 'organisation'] },
        );

        // The order should not be finished yet
        if (payment.order.isFinished) {
            this.logger.warn('Cannot cancel payment for finished orders', {
                context,
                userSession,
                data,
            });
            throw new OrderAlreadyFinishedException();
        }

        // Cancel the payment with the Payconiq API
        await this.payconiqService.cancelPayment(
            (payment.data as PayconiqPaymentData).paymentId,
        );

        // Update the payment
        await this.paymentRepository.update(paymentId, {
            data: {
                ...(payment.data as PayconiqPaymentData),
                status: PaymentStatus.CANCELLED,
            },
            status: PaymentStatus.CANCELLED,
            updatedBy: userSession.email,
        });
    }
}
