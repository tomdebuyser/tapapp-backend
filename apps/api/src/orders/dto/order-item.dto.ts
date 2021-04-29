import {
    IsUUID,
    IsNotEmpty,
    IsInt,
    IsPositive,
    IsNotIn,
} from 'class-validator';
import { Type } from 'class-transformer';

import {
    AuditedEntityResponse,
    ProductRelationResponse,
} from '../../shared/dto';

export class OrderItemResponse extends AuditedEntityResponse {
    @Type(() => Number)
    readonly amount: number;

    @Type(() => ProductRelationResponse)
    readonly product: ProductRelationResponse;
}

export class OrderItemRequest {
    @IsUUID('4')
    readonly id: string;

    @IsInt()
    @IsPositive()
    @IsNotIn([0])
    @Type(() => Number)
    readonly amount: number;

    @IsUUID('4')
    @IsNotEmpty()
    readonly productId: string;
}
