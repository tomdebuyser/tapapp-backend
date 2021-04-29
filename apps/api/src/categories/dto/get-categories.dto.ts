class CategoryProduct {
    readonly id: string;
    readonly logo?: string;
    readonly name: string;
    readonly price: number;
}

export class CategoryResponse {
    readonly id: string;
    readonly name: string;
    readonly products: CategoryProduct[];
}
