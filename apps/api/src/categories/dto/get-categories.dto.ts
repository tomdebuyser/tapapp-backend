import { ProductRelationResponse } from '../../shared/dto';

export class CategoryResponse {
    readonly id: string;
    readonly name: string;
    readonly products: ProductRelationResponse[];
}
