import { AuditedEntityResponse } from '../../shared/dto';
import { OrderItemResponse } from './order-item.dto';

export class OrderResponse extends AuditedEntityResponse {
    readonly clientName?: string;
    readonly items: OrderItemResponse[];
}
