import { IsUUID } from 'class-validator';

export class OrderIdParam {
    @IsUUID('4')
    readonly orderId: string;
}
