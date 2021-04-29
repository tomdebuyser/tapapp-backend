import { EntityRepository, Repository } from 'typeorm';

import { Order, OrderItem } from '../entities';

@EntityRepository(Order)
export class OrderRepository extends Repository<Order> {
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
