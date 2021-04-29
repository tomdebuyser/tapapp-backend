import { Injectable } from '@nestjs/common';

import { OrderRepository } from '@libs/models';
import { IHandler } from '@libs/common';
import { OrderResponse } from '../dto';
import { UserSession } from '../../shared/constants';
import { OrderIdParam } from '../dto/order-id.dto';

type GetOrderQuery = {
    userSession: UserSession;
    data: OrderIdParam;
};

@Injectable()
export class GetOrderHandler implements IHandler<GetOrderQuery> {
    constructor(private readonly orderRepository: OrderRepository) {}

    async execute({
        userSession,
        data,
    }: GetOrderQuery): Promise<OrderResponse> {
        const { organisation } = userSession;
        const { orderId } = data;

        return this.orderRepository
            .createQueryBuilder('order')
            .select([
                'order.id',
                'order.createdAt',
                'order.createdBy',
                'order.updatedAt',
                'order.updatedBy',
                'order.clientName',
                'item.id',
                'item.amount',
                'product.id',
                'product.name',
                'product.price',
            ])
            .innerJoin('order.items', 'item')
            .innerJoin('item.product', 'product')
            .where('order.id = :orderId', { orderId })
            .andWhere('order.organisationId = :organisationId', {
                organisationId: organisation.id,
            })
            .getOne();
    }
}
