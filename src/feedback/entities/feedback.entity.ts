import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from '../../orders/entities/order.entity';

@Entity('feedback')
export class Feedback {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'order_id', type: 'varchar', length: 255 })
  orderId: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ name: 'created_user', type: 'int', nullable: true })
  createdUser: number;

  @CreateDateColumn({ name: 'created_time' })
  createdTime: Date;

  @ManyToOne(() => Order, (order) => order.feedbacks, { nullable: true })
  @JoinColumn({ name: 'order_id', referencedColumnName: 'id' })
  order: Order;
}
