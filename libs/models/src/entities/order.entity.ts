import { Entity, Column, DeepPartial, ManyToOne, OneToMany } from 'typeorm';
import { plainToClass } from 'class-transformer';
import { v4 as uuid } from 'uuid';

import { AuditedEntity } from './audited.entity';
import { Organisation } from './organisation.entity';
import { Product } from './product.entity';
import { Payment } from './payment.entity';

@Entity()
export class Order extends AuditedEntity {
    @Column({ nullable: true })
    clientName?: string;

    /**
     * In euro cents
     */
    @Column()
    totalPrice: number;

    @Column({ default: false })
    isFinished: boolean;

    @ManyToOne(() => Organisation)
    organisation: Organisation;

    @OneToMany(() => OrderItem, item => item.order)
    items: OrderItem[];

    /**
     * There can be mutiple payments linked to one order (e.g. when payconiq payment fails and succeeds the second time)
     */
    @OneToMany(() => Payment, payment => payment.order, {
        nullable: true,
    })
    payments?: Payment[];

    @ManyToOne(() => Order, order => order.mergedOrders, {
        nullable: true,
    })
    mergedInto?: Order;

    @OneToMany(() => Order, order => order.mergedInto)
    mergedOrders: Order[];

    /**
     * Creates a Order instance with given fields.
     * Auto-generated fields (id, dates, ...) are NOT filled in automatically by this method.
     */
    static create(fields: DeepPartial<Order>): Order {
        return plainToClass(Order, { id: uuid(), ...fields });
    }
}

@Entity()
export class OrderItem extends AuditedEntity {
    @Column()
    amount: number;

    @ManyToOne(() => Product)
    product: Product;

    @ManyToOne(() => Order, order => order.items)
    order: Order;

    /**
     * Creates a OrderItem instance with given fields.
     * Auto-generated fields (id, dates, ...) are NOT filled in automatically by this method.
     */
    static create(fields: DeepPartial<OrderItem>): OrderItem {
        return plainToClass(OrderItem, { id: uuid(), ...fields });
    }
}
