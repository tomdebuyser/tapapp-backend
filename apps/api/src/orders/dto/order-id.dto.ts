import { IsUUID } from 'class-validator';

export class OrderIdParam {
    @IsUUID()
    readonly orderId: string;
}
