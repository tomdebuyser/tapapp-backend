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

import { PaymentType } from '@libs/models';
import { UserSession } from '../shared/constants';
import { GetUserSession } from '../shared/decorators';
import { AuthenticatedGuard } from '../shared/guards';
import {
    CancelPayconiqPaymentHandler,
    CreatePayconiqPaymentHandler,
    CreatePaymentHandler,
} from './commands';
import {
    CreatePaymentRequest,
    PayconiqPaymentResponse,
    PaymentIdParam,
} from './dto';
import { GetPayconiqPaymentHandler } from './queries';

@ApiBearerAuth()
@UseGuards(AuthenticatedGuard)
@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
    constructor(
        private readonly createPaymentHandler: CreatePaymentHandler,
        private readonly createPayconiqPaymentHandler: CreatePayconiqPaymentHandler,
        private readonly cancelPayconiqPaymentHandler: CancelPayconiqPaymentHandler,
        private readonly getPayconiqPaymentHandler: GetPayconiqPaymentHandler,
    ) {}

    @HttpCode(HttpStatus.NO_CONTENT)
    @Post('cash')
    createCashPayment(
        @GetUserSession() userSession: UserSession,
        @Body() body: CreatePaymentRequest,
    ): Promise<void> {
        return this.createPaymentHandler.execute({
            userSession,
            type: PaymentType.CASH,
            data: body,
        });
    }

    @HttpCode(HttpStatus.NO_CONTENT)
    @Post('free')
    createFreePayment(
        @GetUserSession() userSession: UserSession,
        @Body() body: CreatePaymentRequest,
    ): Promise<void> {
        return this.createPaymentHandler.execute({
            userSession,
            type: PaymentType.FREE,
            data: body,
        });
    }

    @Post('payconiq')
    async createPayconiqPayment(
        @GetUserSession() userSession: UserSession,
        @Body() body: CreatePaymentRequest,
    ): Promise<PayconiqPaymentResponse> {
        const { id } = await this.createPayconiqPaymentHandler.execute({
            userSession,
            data: body,
        });
        return this.getPayconiqPaymentHandler.execute({
            data: { paymentId: id },
            userSession,
        });
    }

    @Get('payconiq/:paymentId')
    getPayconiqPayment(
        @GetUserSession() userSession: UserSession,
        @Param() params: PaymentIdParam,
    ): Promise<PayconiqPaymentResponse> {
        return this.getPayconiqPaymentHandler.execute({
            userSession,
            data: params,
        });
    }

    @Delete('payconiq/:paymentId')
    cancelPayconiqPayment(
        @GetUserSession() userSession: UserSession,
        @Param() params: PaymentIdParam,
    ): Promise<void> {
        return this.cancelPayconiqPaymentHandler.execute({
            userSession,
            data: params,
        });
    }
}
