import {
    Entity,
    Column,
    DeepPartial,
    ManyToOne,
    OneToOne,
    JoinColumn,
} from 'typeorm';
import { plainToClass } from 'class-transformer';
import { v4 as uuid } from 'uuid';

import { Organisation } from './organisation.entity';
import { AuditedEntity } from './audited.entity';
import { Order } from './order.entity';

export enum PaymentType {
    CASH = 'CASH',
    FREE = 'FREE',
    PAYCONIQ = 'PAYCONIQ',
}

export enum PaymentStatus {
    CANCELLED = 'CANCELLED',
    FAILED = 'FAILED',
    PENDING = 'PENDING',
    SUCCEEDED = 'SUCCEEDED',
}

@Entity()
export class Payment extends AuditedEntity {
    /**
     * In eurocents
     */
    @Column()
    amount: number;

    @Column({ enum: PaymentType, type: 'enum' })
    type: PaymentType;

    @Column({
        enum: PaymentStatus,
        type: 'enum',
    })
    status: PaymentStatus;

    /**
     * This column contains extra information coming from the external payment provider (e.g. payconiq)
     */
    @Column({ nullable: true, type: 'jsonb' })
    data?: unknown;

    @ManyToOne(() => Organisation)
    organisation: Organisation;

    /**
     * A payment is not necessarily linked to an order. One could just create a (payconiq) payment as well.
     */
    @ManyToOne(() => Order, order => order.payments, { nullable: true })
    order?: Order;

    /**
     * Creates a Payment instance with given fields.
     * Auto-generated fields (id, dates, ...) are NOT filled in automatically by this method.
     */
    static create(fields: DeepPartial<Payment>): Payment {
        return plainToClass(Payment, { id: uuid(), ...fields });
    }
}
