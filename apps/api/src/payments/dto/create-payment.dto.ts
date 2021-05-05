import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreatePaymentRequest {
    @IsUUID('4')
    @IsNotEmpty()
    readonly orderId: string;
}
