import { Injectable } from '@nestjs/common';

import {
    OrderRepository,
    Order,
    OrderItem,
    OrderItemRepository,
} from '@libs/models';
import { LoggerService } from '@libs/logger';
import { IHandler } from '@libs/common';
import { UserSession } from '../../shared/constants';
import { OrdersService } from '../orders.service';
import { OrderIdParam } from '../dto/order-id.dto';
import { OrderAlreadyFinishedException } from '../orders.errors';

const context = 'DeleteOrderHandler';

export type DeleteOrderCommand = {
    userSession: UserSession;
    data: OrderIdParam;
};

@Injectable()
export class DeleteOrderHandler implements IHandler<DeleteOrderCommand> {
    constructor(
        private readonly orderRepository: OrderRepository,
        private readonly orderItemRepository: OrderItemRepository,
        private readonly logger: LoggerService,
    ) {}

    async execute({ userSession, data }: DeleteOrderCommand): Promise<void> {
        const { orderId } = data;
        // The order should already exist
        const existingOrder = await this.orderRepository.findOneOrThrow(
            { id: orderId, organisation: { id: userSession.organisation.id } },
            {
                relations: ['items'],
            },
        );

        // Cannot delete finished orders
        if (existingOrder.isFinished) {
            this.logger.warn('Cannot delete finished orders', {
                context,
                userSession,
                data,
            });
            throw new OrderAlreadyFinishedException();
        }

        // Delete linked order items
        await this.orderItemRepository.delete(
            existingOrder.items.map(item => item.id),
        );

        // Delete the order
        await this.orderRepository.delete(orderId);
    }
}
