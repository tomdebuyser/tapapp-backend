import { IsNotEmpty, IsUUID } from 'class-validator';

export class PaymentIdParam {
    @IsUUID('4')
    @IsNotEmpty()
    readonly paymentId: string;
}
