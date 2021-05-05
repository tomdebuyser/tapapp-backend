import { PayconiqPaymentStatus } from '@libs/payconiq';

export class PayconiqPaymentResponse {
    readonly id: string;
    readonly orderId: string;
    readonly qrCode: string;
    readonly status: PayconiqPaymentStatus;
}
