import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { UserSession } from '../shared/constants';
import { GetUserSession } from '../shared/decorators';
import { AuthenticatedGuard } from '../shared/guards';
import { CreateOrderHandler } from './commands';
import { CreateOrderRequest } from './dto';
import { OrderResponse } from './dto/get-order.dto';
import { GetOrderHandler } from './queries';

@ApiBearerAuth()
@UseGuards(AuthenticatedGuard)
@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
    constructor(
        private readonly getOrderHandler: GetOrderHandler,
        private readonly createOrderHandler: CreateOrderHandler,
    ) {}

    @Post()
    async getOrders(
        @GetUserSession() userSession: UserSession,
        @Body() body: CreateOrderRequest,
    ): Promise<OrderResponse> {
        const { id } = await this.createOrderHandler.execute({
            userSession,
            data: body,
        });
        return this.getOrderHandler.execute({
            userSession,
            data: { orderId: id },
        });
    }
}
