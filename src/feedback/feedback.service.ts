import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Feedback } from './entities/feedback.entity';
import { Order } from '../orders/entities/order.entity';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectRepository(Feedback)
    private readonly feedbackRepo: Repository<Feedback>,
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,
    private readonly notificationService: NotificationService,
  ) {}

  async create(dto: CreateFeedbackDto) {
    const order = await this.orderRepo.findOne({ where: { id: dto.orderId } });
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const feedback = this.feedbackRepo.create(dto);
    await this.feedbackRepo.save(feedback);

    // Tạo thông báo chi tiết
    const notificationContent = `Đơn hàng: ${order.projectName} (ID: ${order.id})
Dịch vụ: ${order.service}
Feedback: "${dto.content}"`;

    // Gửi thông báo không chặn luồng chính
    this.sendNotifications(order, notificationContent).catch(error => {
      console.error('Failed to send notifications:', error);
    });

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Success',
      data: feedback,
    };
  }

  private async sendNotifications(order: Order, content: string): Promise<void> {
    try {
      await this.notificationService.create({
        title: `Feedback mới cho đơn hàng ${order.projectName}`,
        content,
        receiverId: 1, 
      });

      if (order.assignedId) {
        await this.notificationService.create({
          title: `Feedback mới cho đơn hàng ${order.projectName}`,
          content,
          receiverId: order.assignedId,
        });
      }
    } catch (error) {
      console.error('Error sending notifications:', error);
    }
  }

  async findAll(orderId?: string) {
    const where: any = {};
    if (orderId) where.orderId = orderId;

    const [feedbacks, total] = await this.feedbackRepo.findAndCount({
      where,
      order: { createdTime: 'DESC' },
    });

    return {
      data: {
        count: total,
        list: feedbacks,
      },
    };
  }

  async findByAssignId(assignId: number) {
    const orders = await this.orderRepo.find({
      where: { assignedId: assignId },
      relations: ['feedbacks'],
      order: {
        createdTime:  'DESC' 
      },
    });
  
    const allFeedbacks = orders.flatMap((order) => order.feedbacks);
   
    return {
      data: {
        count: allFeedbacks.length,
        list: allFeedbacks,
      },
    };
  } 
  
}
