import { Injectable } from '@nestjs/common';
import { without } from 'ramda';
import { In } from 'typeorm';

import {
    OrderRepository,
    Order,
    OrderItem,
    OrderItemRepository,
} from '@libs/models';
import { LoggerService } from '@libs/logger';
import { IHandler } from '@libs/common';
import { UserSession } from '../../shared/constants';
import { UpdateOrderItemRequest, UpdateOrderRequest } from '../dto';
import {
    OrderAlreadyFinishedException,
    OrderClientNameAlreadyInUseException,
} from '../orders.errors';
import { OrdersService } from '../orders.service';

const context = 'UpdateOrderHandler';

export type UpdateOrderCommand = {
    userSession: UserSession;
    orderId: string;
    data: UpdateOrderRequest;
};

@Injectable()
export class UpdateOrderHandler implements IHandler<UpdateOrderCommand> {
    constructor(
        private readonly orderRepository: OrderRepository,
        private readonly orderItemRepository: OrderItemRepository,
        private readonly ordersService: OrdersService,
        private readonly logger: LoggerService,
    ) {}

    async execute({
        userSession,
        orderId,
        data,
    }: UpdateOrderCommand): Promise<{ id: string }> {
        const { clientName, items } = data;

        // The order should already exist
        const existingOrder = await this.orderRepository.findOneOrThrow(
            { id: orderId, organisation: { id: userSession.organisation.id } },
            {
                relations: ['items', 'items.product'],
            },
        );

        // Cannot update finished orders (merging should be used for this)
        if (existingOrder.isFinished) {
            this.logger.warn(
                'Cannot update finished orders (use merge instead)',
                {
                    context,
                    userSession,
                    data,
                },
            );
            throw new OrderAlreadyFinishedException();
        }

        // There should not exist another unfinished order with the given clientName
        const otherOrder = await this.orderRepository.findUnfinishedOrderWithClientName(
            clientName,
            userSession.organisation.id,
        );
        if (otherOrder && otherOrder.id !== orderId) {
            this.logger.warn(
                'Cannot set clientName as it already exists for an unfinished order',
                {
                    context,
                    userSession,
                    data,
                },
            );
            throw new OrderClientNameAlreadyInUseException();
        }

        // All passed items should have an existing and active product
        const products = await this.ordersService.validateAndGetProducts(
            (items || []).map(item => item.productId),
        );

        // Update the order
        if (clientName) existingOrder.clientName = clientName;
        existingOrder.totalPrice = this.ordersService.calculateTotalPrice(
            items,
            products,
        );
        existingOrder.updatedBy = userSession.email;
        await this.orderRepository.save(existingOrder);

        // Update the items
        await this.updateOrderItems(existingOrder, items, userSession);

        return { id: orderId };
    }

    private async updateOrderItems(
        order: Order,
        items: UpdateOrderItemRequest[],
        userSession: UserSession,
    ): Promise<void> {
        const itemIds = items.map(item => item.id).filter(id => !!id);

        // Delete the linked items that are not in the list anymore
        const idsToDelete = order.items
            .map(item => item.id)
            .filter(itemId => itemId && !itemIds.includes(itemId));
        if (idsToDelete.length > 0) {
            await this.orderItemRepository.delete(idsToDelete);
        }

        // Link the items that are new in the list
        const itemsToCreate = items
            .filter(
                item =>
                    !order.items.some(
                        existingItem =>
                            existingItem.product.id === item.productId,
                    ),
            )
            .map(item =>
                OrderItem.create({
                    amount: item.amount,
                    createdBy: userSession.email,
                    order: { id: order.id },
                    product: { id: item.productId },
                    updatedBy: userSession.email,
                }),
            );
        if (itemsToCreate.length > 0) {
            await this.orderItemRepository.save(itemsToCreate);
        }

        // Update the items that were already linked
        const existingItemIds = without(idsToDelete, itemIds);
        if (existingItemIds.length > 0) {
            const existingItems = await this.orderItemRepository.find({
                id: In(existingItemIds),
            });
            existingItems.forEach(existingItem => {
                existingItem.amount = items.find(
                    item => item.id === existingItem.id,
                ).amount;
                existingItem.updatedBy = userSession.email;
            });
            await this.orderItemRepository.save(existingItems);
        }
    }
}
