import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Feedback } from './entities/feedback.entity';
import { Order } from '../orders/entities/order.entity';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectRepository(Feedback)
    private readonly feedbackRepo: Repository<Feedback>,
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,
  ) {}

  async create(dto: CreateFeedbackDto) {
    const order = await this.orderRepo.findOne({ where: { id: dto.orderId } });
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const feedback = this.feedbackRepo.create(dto);
    await this.feedbackRepo.save(feedback);

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Success',
      data: feedback,
    };
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
}
