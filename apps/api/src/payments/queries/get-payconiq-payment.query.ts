import { Injectable } from '@nestjs/common';

import { OrderRepository, PaymentRepository, PaymentType } from '@libs/models';
import { IHandler } from '@libs/common';
import { PayconiqPaymentResponse, PaymentIdParam } from '../dto';
import { UserSession } from '../../shared/constants';
import { PayconiqPaymentData, PayconiqService } from '@libs/payconiq';

type GetPayconiqPaymentQuery = {
    userSession: UserSession;
    data: PaymentIdParam;
};

@Injectable()
export class GetPayconiqPaymentHandler
    implements IHandler<GetPayconiqPaymentQuery> {
    constructor(
        private readonly paymentRepository: PaymentRepository,
        private readonly payconiqService: PayconiqService,
    ) {}

    async execute({
        userSession,
        data,
    }: GetPayconiqPaymentQuery): Promise<PayconiqPaymentResponse> {
        const { organisation } = userSession;
        const { paymentId } = data;

        // Check if the payconiq payment exists
        const payment = await this.paymentRepository.findOneOrThrow(
            {
                id: paymentId,
                type: PaymentType.PAYCONIQ,
                organisation: { id: organisation.id },
            },
            { relations: ['order', 'organisation'] },
        );

        // Fetch the details at payconiq
        const payconiqData = await this.payconiqService.fetchPayment(
            (payment.data as PayconiqPaymentData).paymentId,
        );

        return {
            id: paymentId,
            orderId: payment.order.id,
            qrCode: payconiqData._links.qrcode.href,
            status: payconiqData.status,
        };
    }
}
