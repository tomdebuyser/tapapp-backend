import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { UserSession } from '../shared/constants';
import { GetUserSession } from '../shared/decorators';
import { AuthenticatedGuard } from '../shared/guards';
import { CreateOrderHandler } from './commands';
import { DeleteOrderHandler } from './commands/delete-order.command';
import { CreateOrderRequest } from './dto';
import { OrderResponse } from './dto/get-order.dto';
import { OrderIdParam } from './dto/order-id.dto';
import { GetOrderHandler } from './queries';

@ApiBearerAuth()
@UseGuards(AuthenticatedGuard)
@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
    constructor(
        private readonly getOrderHandler: GetOrderHandler,
        private readonly createOrderHandler: CreateOrderHandler,
        private readonly deleteOrderHandler: DeleteOrderHandler,
    ) {}

    @Get(':orderId')
    async getOrder(
        @GetUserSession() userSession: UserSession,
        @Param() params: OrderIdParam,
    ): Promise<OrderResponse> {
        return this.getOrderHandler.execute({
            userSession,
            data: params,
        });
    }

    @Post()
    async createOrder(
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

    @HttpCode(HttpStatus.NO_CONTENT)
    @Delete(':orderId')
    deleteOrder(
        @GetUserSession() userSession: UserSession,
        @Param() params: OrderIdParam,
    ): Promise<void> {
        return this.deleteOrderHandler.execute({ userSession, data: params });
    }
}
