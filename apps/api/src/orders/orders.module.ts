import { Module } from '@nestjs/common';

import { SharedModule } from '../shared/shared.module';
import { CreateOrderHandler } from './commands';
import { DeleteOrderHandler } from './commands/delete-order.command';
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
    ],
})
export class OrdersModule {}
