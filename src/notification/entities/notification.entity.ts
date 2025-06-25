import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('notification')
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ name: 'receiver_id', type: 'int' })
  receiverId: number;

  @CreateDateColumn({ name: 'created_time' })
  createdTime: Date;

  @Column({ name: 'is_read', type: 'boolean', default: false })
  isRead: boolean;
}
