import { EntityRepository, Repository } from 'typeorm';

import { Payment } from '../entities';

@EntityRepository(Payment)
export class PaymentRepository extends Repository<Payment> {}
