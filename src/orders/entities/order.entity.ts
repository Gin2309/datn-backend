import {
  Entity,
  Column,
  PrimaryColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
//   import { Feedback } from './feedback.entity';

@Entity('order')
export class Order {
  @PrimaryColumn({ type: 'varchar', length: 255 })
  id: string;

  @Column({ name: 'project_name', type: 'varchar', length: 255 })
  projectName: string;

  @Column({ type: 'varchar', length: 255 })
  service: string;

  @Column({
    name: 'upload_image',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  uploadImage?: string;

  @Column({ type: 'tinyint', default: 1, nullable: true })
  quantity?: number;

  @Column({
    name: 'design_style',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  designStyle?: string;

  @Column({
    name: 'photo_detail',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  photoDetail?: string;

  @Column({
    name: 'photo_completed',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  photoCompleted?: string;

  @Column({ name: 'customer_id', type: 'int' })
  customerId: number;

  @ManyToOne(() => User, (user) => user.orders)
  user: User;

  @Column({ name: 'service_price', type: 'float' })
  servicePrice: number;

  @Column({
    name: 'additional_service',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  additionalService?: string;

  @Column({ name: 'additional_service_price', type: 'float', nullable: true })
  additionalServicePrice?: number;

  @Column({ name: 'order_total', type: 'float', nullable: true })
  orderTotal?: number;

  @Column({ type: 'varchar', length: 255 })
  status: string;

  @Column({ name: 'is_agreed', type: 'tinyint', default: 0, nullable: true })
  isAgreed?: number;

  @Column({ name: 'created_user', type: 'int', nullable: true })
  createdUser?: number;

  @Column({ name: 'updated_user', type: 'int', nullable: true })
  updatedUser?: number;

  @CreateDateColumn({ name: 'created_time' })
  createdTime: Date;

  @UpdateDateColumn({ name: 'updated_time' })
  updatedTime: Date;

  // @OneToMany(() => Feedback, (feedback) => feedback.order)
  // feedbacks: Feedback[];

  @Column({ name: 'sub_service', type: 'varchar', length: 255, nullable: true })
  subService?: string;

  @Column({ name: 'add_on_service', type: 'text', nullable: true })
  addOnService?: string;

  @Column({
    name: 'style_detail',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  styleDetail?: string;

  @Column({ name: 'assigned_id', type: 'int', nullable: true })
  assignedId?: number;
}
