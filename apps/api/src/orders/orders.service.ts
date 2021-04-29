import { Injectable } from '@nestjs/common';
import { In } from 'typeorm';

import { Product, ProductRepository } from '@libs/models';
import { LoggerService } from '@libs/logger';
import {
    OrderItemProductNotActiveException,
    OrderItemProductNotFoundException,
} from './orders.errors';
import { OrderItemRequest } from './dto';

const context = 'OrdersService';

@Injectable()
export class OrdersService {
    constructor(
        private readonly productRepository: ProductRepository,
        private readonly logger: LoggerService,
    ) {}

    /**
     * This function checks the existence of an active product for each product id
     * @returns
     */
    async validateAndGetProducts(productIds: string[]): Promise<Product[]> {
        if (!productIds.length) return new Promise(resolve => resolve([]));

        // All products should exist
        const products = await this.productRepository.find({
            id: In(productIds),
        });
        if (products.length !== productIds.length) {
            this.logger.warn('One of the passed productIds does not exist', {
                context,
                productIds,
            });
            throw new OrderItemProductNotFoundException();
        }

        // All products should be active
        if (products.some(product => !product.isActive)) {
            this.logger.warn('One of the passed productIds is not active', {
                context,
                productIds,
            });
            throw new OrderItemProductNotActiveException();
        }

        return products;
    }

    /**
     * This function calculates the total price of a set of order items.
     * TODO: Use Dinero
     */
    calculateTotalPrice(
        items: Omit<OrderItemRequest, 'id'>[],
        products: Product[],
    ): number {
        return items.reduce(
            (acc, item) =>
                acc +
                item.amount *
                    products.find(product => product.id === item.productId)
                        .price,
            0,
        );
    }
}
