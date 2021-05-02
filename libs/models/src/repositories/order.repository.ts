import { NotFoundException } from '@nestjs/common';
import {
    EntityRepository,
    FindConditions,
    FindOneOptions,
    Repository,
} from 'typeorm';

import { Order, OrderItem } from '../entities';

class OrderNotFound extends NotFoundException {
    constructor() {
        super('Order was not found', 'ORDER_NOT_FOUND');
    }
}

@EntityRepository(Order)
export class OrderRepository extends Repository<Order> {
    async findOneOrThrow(
        condition: FindConditions<Order>,
        options: FindOneOptions<Order> = {},
        error: { new (...args: unknown[]): unknown } = OrderNotFound,
    ): Promise<Order> {
        try {
            const result = await this.findOneOrFail(condition, options);
            return result;
        } catch {
            throw new error();
        }
    }

    findUnfinishedOrderWithClientName(
        clientName: string,
        organisationId: string,
    ): Promise<Order> {
        if (!clientName) return null;
        return this.findOne(
            { clientName },
            {
                relations: ['organisation'],
                where: { isFinished: false, organisationId },
            },
        );
    }
}

@EntityRepository(OrderItem)
export class OrderItemRepository extends Repository<OrderItem> {}
