import { Type } from 'class-transformer';

import { PaymentStatus, PaymentType } from '@libs/models';
import { BaseEntityResponse } from './base-entity.dto';

export class OrderPaymentResponse extends BaseEntityResponse {
    readonly amount: number;
    readonly status: PaymentStatus;
    readonly type: PaymentType;
    readonly data?: PayconiqPaymentData;
}

export class PaymentResponse extends OrderPaymentResponse {
    readonly orderId: string;
}

class Link {
    href: string;
}

class PayconiqLinks {
    cancel?: Link;
    qrcode: Link;
    self: Link;
}

class PayconiqCreditor {
    callbackUrl: string;
    iban: string;
    merchantId: string;
    name: string;
    profileId: string;
}

class PayconiqDebtor {
    iban: string;
    name: string;
}

export class PayconiqPaymentData {
    @Type(() => PayconiqLinks)
    _links: PayconiqLinks;
    amount: number;
    createdAt: string;
    @Type(() => PayconiqCreditor)
    creditor?: PayconiqCreditor;
    @Type(() => String)
    currency: 'EUR';
    @Type(() => PayconiqDebtor)
    debtor?: PayconiqDebtor;
    description: string;
    expireAt: string;
    paymentId?: string;
    reference?: string;
    status: string;
    totalAmount: number;
}
