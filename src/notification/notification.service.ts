import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { ReadNotificationsDto } from './dto/read-notifications.dto';
import { FirebaseAdminService } from '../firebase/firebase-admin.service';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
    private readonly firebaseAdminService: FirebaseAdminService,
  ) {}

  async create(createNotificationDto: CreateNotificationDto) {
    const notification = this.notificationRepo.create(createNotificationDto);
    await this.notificationRepo.save(notification);

    try {
      await this.firebaseAdminService.sendNotification(notification.content);
    } catch (error) {
      console.error('Failed to send Firebase notification:', error);
    }

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Success',
      data: notification,
    };
  }

  async findAll(receiverId?: number, page = 1, size = 10) {
    const where: any = {};
    if (receiverId) where.receiverId = receiverId;

    const [notifications, total] = await this.notificationRepo.findAndCount({
      where,
      order: { createdTime: 'DESC' },
      skip: (page - 1) * size,
      take: size,
    });

    return {
      data: {
        count: total,
        list: notifications,
        page,
        size,
        totalPages: Math.ceil(total / size),
      },
    };
  }

  async findOne(id: number) {
    const notification = await this.notificationRepo.findOne({ where: { id } });
    
    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    return {
      data: notification,
    };
  }

  async findByIds(readNotificationsDto: ReadNotificationsDto) {
    const { ids } = readNotificationsDto;
    
    const notifications = await this.notificationRepo.find({
      where: { id: In(ids) },
    });

    return {
      data: {
        count: notifications.length,
        list: notifications,
      },
    };
  }

  async update(id: number, updateNotificationDto: UpdateNotificationDto) {
    const notification = await this.notificationRepo.findOne({ where: { id } });
    
    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    await this.notificationRepo.update(id, updateNotificationDto);
    
    const updatedNotification = await this.notificationRepo.findOne({ where: { id } });

    return {
      statusCode: HttpStatus.OK,
      message: 'Success',
      data: updatedNotification,
    };
  }

  async markAsRead(readNotificationsDto: ReadNotificationsDto) {
    const { ids } = readNotificationsDto;
    
    await this.notificationRepo.update(
      { id: In(ids) },
      { isRead: true }
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Notifications marked as read',
    };
  }

  async remove(id: number) {
    const notification = await this.notificationRepo.findOne({ where: { id } });
    
    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    await this.notificationRepo.remove(notification);

    return {
      statusCode: HttpStatus.OK,
      message: 'Notification deleted successfully',
    };
  }
}
