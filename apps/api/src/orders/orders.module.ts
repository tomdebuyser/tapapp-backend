import { Module } from '@nestjs/common';

import { SharedModule } from '../shared/shared.module';
import {
    CreateOrderHandler,
    UpdateOrderHandler,
    DeleteOrderHandler,
} from './commands';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { GetOrderHandler } from './queries';

@Module({
    imports: [SharedModule],
    controllers: [OrdersController],
    providers: [
        OrdersService,
        GetOrderHandler,
        CreateOrderHandler,
        DeleteOrderHandler,
        UpdateOrderHandler,
    ],
})
export class OrdersModule {}
