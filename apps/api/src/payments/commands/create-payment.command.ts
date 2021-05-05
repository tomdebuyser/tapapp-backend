import { Injectable } from '@nestjs/common';

import { LoggerService } from '@libs/logger';
import { IHandler } from '@libs/common';
import { UserSession } from '../../shared/constants';
import { CreatePaymentRequest } from '../dto';
import {
    OrderRepository,
    Payment,
    PaymentRepository,
    PaymentStatus,
    PaymentType,
} from '@libs/models';
import { OrderAlreadyFinishedException } from '../../orders/orders.errors';

const context = 'CreatePaymentHandler';

export type CreatePaymentCommand = {
    userSession: UserSession;
    type: PaymentType.CASH | PaymentType.FREE;
    data: CreatePaymentRequest;
};

@Injectable()
export class CreatePaymentHandler implements IHandler<CreatePaymentCommand> {
    constructor(
        private readonly orderRepository: OrderRepository,
        private readonly paymentRepository: PaymentRepository,
        private readonly logger: LoggerService,
    ) {}

    async execute({
        userSession,
        type,
        data,
    }: CreatePaymentCommand): Promise<void> {
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

        // Save the succeeded payment
        const payment = Payment.create({
            amount: order.totalPrice,
            createdBy: userSession.email,
            order: { id: order.id },
            organisation: { id: userSession.organisation.id },
            status: PaymentStatus.SUCCEEDED,
            type,
            updatedBy: userSession.email,
        });
        await this.paymentRepository.save(payment);

        // Mark the order as finished
        await this.orderRepository.update(order.id, {
            isFinished: true,
            updatedBy: userSession.email,
        });
    }
}
