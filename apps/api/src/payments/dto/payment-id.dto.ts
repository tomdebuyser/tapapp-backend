import { IsNotEmpty, IsUUID } from 'class-validator';

export class PaymentIdParam {
    @IsUUID()
    @IsNotEmpty()
    readonly paymentId: string;
}
