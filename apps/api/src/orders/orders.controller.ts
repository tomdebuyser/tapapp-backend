import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    Put,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { UserSession } from '../shared/constants';
import { GetUserSession } from '../shared/decorators';
import { AuthenticatedGuard } from '../shared/guards';
import {
    CreateOrderHandler,
    DeleteOrderHandler,
    UpdateOrderHandler,
} from './commands';
import {
    CreateOrderRequest,
    UpdateOrderRequest,
    OrderResponse,
    OrderIdParam,
} from './dto';
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
        private readonly updateOrderHandler: UpdateOrderHandler,
    ) {}

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

    @HttpCode(HttpStatus.NO_CONTENT)
    @Delete(':orderId')
    deleteOrder(
        @GetUserSession() userSession: UserSession,
        @Param() params: OrderIdParam,
    ): Promise<void> {
        return this.deleteOrderHandler.execute({ userSession, data: params });
    }

    @Put(':orderId')
    async updateOrder(
        @GetUserSession() userSession: UserSession,
        @Param() params: OrderIdParam,
        @Body() body: UpdateOrderRequest,
    ): Promise<OrderResponse> {
        const { id } = await this.updateOrderHandler.execute({
            userSession,
            orderId: params.orderId,
            data: body,
        });
        return this.getOrderHandler.execute({
            userSession,
            data: { orderId: id },
        });
    }
}
