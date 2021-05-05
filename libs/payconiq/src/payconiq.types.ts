import { PaymentStatus } from '@libs/models';

type Link = {
    readonly href: string;
};

type PayconiqLinks = {
    readonly cancel?: Link;
    readonly qrcode: Link;
    readonly self: Link;
};

type PayconiqCreditor = {
    readonly callbackUrl: string;
    readonly iban: string;
    readonly merchantId: string;
    readonly name: string;
    readonly profileId: string;
};

type PayconiqDebtor = {
    readonly iban: string;
    readonly name: string;
};

export enum PayconiqPaymentStatus {
    AUTHORIZATION_FAILED = 'AUTHORIZATION_FAILED',
    AUTHORIZED = 'AUTHORIZED',
    CANCELLED = 'CANCELLED',
    EXPIRED = 'EXPIRED',
    FAILED = 'FAILED',
    IDENTIFIED = 'IDENTIFIED',
    PENDING = 'PENDING',
    SUCCEEDED = 'SUCCEEDED',
}

export type PayconiqPaymentData = {
    _links: PayconiqLinks;
    amount: number;
    createdAt: string;
    creditor?: PayconiqCreditor;
    currency: 'EUR';
    debtor?: PayconiqDebtor;
    description: string;
    expireAt: string;
    paymentId: string;
    reference?: string;
    status: PayconiqPaymentStatus;
    totalAmount: number;
};

export function paymentStatusFromPayconiqStatus(
    payconiqStatus: PayconiqPaymentStatus,
): PaymentStatus {
    switch (payconiqStatus) {
        case PayconiqPaymentStatus.PENDING:
        case PayconiqPaymentStatus.IDENTIFIED:
        case PayconiqPaymentStatus.AUTHORIZED:
            return PaymentStatus.PENDING;
        case PayconiqPaymentStatus.SUCCEEDED:
            return PaymentStatus.SUCCEEDED;
        case PayconiqPaymentStatus.FAILED:
        case PayconiqPaymentStatus.AUTHORIZATION_FAILED:
        case PayconiqPaymentStatus.EXPIRED:
            return PaymentStatus.FAILED;
        case PayconiqPaymentStatus.CANCELLED:
            return PaymentStatus.CANCELLED;
    }
}
