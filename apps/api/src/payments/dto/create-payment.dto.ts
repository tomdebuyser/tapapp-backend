import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreatePaymentRequest {
    @IsUUID()
    @IsNotEmpty()
    readonly orderId: string;
}
