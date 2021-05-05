import { NotFoundException } from '@nestjs/common';
import {
    EntityRepository,
    FindConditions,
    FindOneOptions,
    Repository,
} from 'typeorm';

import { Payment } from '../entities';

class PaymentNotFound extends NotFoundException {
    constructor() {
        super('Payment was not found', 'PAYMENT_NOT_FOUND');
    }
}

@EntityRepository(Payment)
export class PaymentRepository extends Repository<Payment> {
    async findOneOrThrow(
        condition: FindConditions<Payment>,
        options: FindOneOptions<Payment> = {},
        error: { new (...args: unknown[]): unknown } = PaymentNotFound,
    ): Promise<Payment> {
        try {
            const result = await this.findOneOrFail(condition, options);
            return result;
        } catch {
            throw new error();
        }
    }
}
