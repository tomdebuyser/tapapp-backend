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
import { CreateOrderRequest } from '../dto';
import { OrderClientNameAlreadyInUseException } from '../orders.errors';
import { OrdersService } from '../orders.service';

const context = 'CreateOrderHandler';

export type CreateOrderCommand = {
    userSession: UserSession;
    data: CreateOrderRequest;
};

@Injectable()
export class CreateOrderHandler implements IHandler<CreateOrderCommand> {
    constructor(
        private readonly orderRepository: OrderRepository,
        private readonly orderItemRepository: OrderItemRepository,
        private readonly ordersService: OrdersService,
        private readonly logger: LoggerService,
    ) {}

    async execute({
        userSession,
        data,
    }: CreateOrderCommand): Promise<{ id: string }> {
        const { organisation, email } = userSession;
        const { clientName, items } = data;

        // The order with this client name should not exist yet for the organisation
        const existingOrder = await this.orderRepository.findUnfinishedOrderWithClientName(
            clientName,
            organisation.id,
        );
        if (existingOrder) {
            this.logger.warn(
                'There already exists an order with the provided clientName',
                { context, userSession, data },
            );
            throw new OrderClientNameAlreadyInUseException();
        }

        // All passed items should have an existing and active product
        const products = await this.ordersService.validateAndGetProducts(
            items.map(item => item.productId),
        );

        // Save the new order
        const order = Order.create({
            clientName,
            createdBy: email,
            isFinished: false,
            organisation: { id: organisation.id },
            totalPrice: this.ordersService.calculateTotalPrice(items, products),
            updatedBy: email,
        });
        await this.orderRepository.save(order);

        // Save the order items
        const orderItems = items.map(item =>
            OrderItem.create({
                amount: item.amount,
                createdBy: email,
                order: { id: order.id },
                product: { id: item.productId },
                updatedBy: email,
            }),
        );
        await this.orderItemRepository.save(orderItems);

        return { id: order.id };
    }
}
