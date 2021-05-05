import { Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';

import { LoggerService } from '@libs/logger';
import { IHandler } from '@libs/common';
import { UserSession } from '../../shared/constants';
import { CreatePaymentRequest } from '../dto';
import {
    OrderRepository,
    Payment,
    PaymentRepository,
    PaymentType,
} from '@libs/models';
import { OrderAlreadyFinishedException } from '../../orders/orders.errors';
import {
    PayconiqService,
    paymentStatusFromPayconiqStatus,
} from '@libs/payconiq';

const context = 'CreatePayconiqPaymentHandler';

export type CreatePayconiqPaymentCommand = {
    userSession: UserSession;
    data: CreatePaymentRequest;
};

@Injectable()
export class CreatePayconiqPaymentHandler
    implements IHandler<CreatePayconiqPaymentCommand> {
    constructor(
        private readonly payconiqService: PayconiqService,
        private readonly orderRepository: OrderRepository,
        private readonly paymentRepository: PaymentRepository,
        private readonly logger: LoggerService,
    ) {}

    async execute({
        userSession,
        data,
    }: CreatePayconiqPaymentCommand): Promise<{ id: string }> {
        const { orderId } = data;

        // An order with the provided orderId should exist
        const order = await this.orderRepository.findOneOrThrow({
            id: orderId,
            organisation: { id: userSession.organisation.id },
        });

        // The order should not be finished yet
        if (order.isFinished) {
            this.logger.warn('Cannot create payment for finished orders', {
                context,
                userSession,
                data,
            });
            throw new OrderAlreadyFinishedException();
        }

        // Create a payment with the Payconiq API
        const paymentId = uuid();
        const payconiqData = await this.payconiqService.createPayment(
            order.totalPrice,
            order.id,
            paymentId,
        );

        // Save the payment
        const payment = Payment.create({
            amount: order.totalPrice,
            createdBy: userSession.email,
            data: payconiqData,
            id: paymentId,
            order: { id: order.id },
            organisation: { id: userSession.organisation.id },
            status: paymentStatusFromPayconiqStatus(payconiqData.status),
            type: PaymentType.PAYCONIQ,
            updatedBy: userSession.email,
        });
        await this.paymentRepository.save(payment);

        return { id: payment.id };
    }
}
