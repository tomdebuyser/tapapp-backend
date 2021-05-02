import { Type } from 'class-transformer';

import {
    AuditedEntityResponse,
    ProductRelationResponse,
} from '../../shared/dto';

class OrderItemResponse extends AuditedEntityResponse {
    @Type(() => Number)
    readonly amount: number;

    @Type(() => ProductRelationResponse)
    readonly product: ProductRelationResponse;
}

export class OrderResponse extends AuditedEntityResponse {
    readonly clientName?: string;
    readonly items: OrderItemResponse[];
}
