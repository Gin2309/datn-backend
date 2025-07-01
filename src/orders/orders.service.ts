import { v4 as uuidv4 } from 'uuid';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { User } from '../user/entities/user.entity';
import { OrderStatus } from '../common/enum';
import { UserRole } from '../common/enum';
import { validateOrderPermission } from '../utils/permission.util';
import { AssignEmployeeDto } from './dto/assign.dto';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly notificationService: NotificationService,
  ) {}

  async create(userRequest: User, data: CreateOrderDto) {
    const orderExists = await this.orderRepository.findOne({
      where: { id: data.id },
    });

    if (orderExists) {
      throw new ConflictException('Order ID already exists');
    }

    const projectNameExists = await this.orderRepository.findOne({
      where: {
        projectName: data.projectName,
        customerId: userRequest.id,
      },
    });

    if (projectNameExists) {
      throw new ConflictException('Project Name already exists for this user');
    }

    const order = this.orderRepository.create({
      id: data.id,
      projectName: data.projectName,
      service: data.service,
      uploadImage: data.uploadImage || null,
      quantity: data.quantity,
      servicePrice: data.servicePrice,
      customerId: userRequest.id,
      status: OrderStatus.AWAITING,
      createdUser: userRequest.id,
      updatedUser: userRequest.id,

      designStyle: null,
      photoDetail: null,
      additionalService: null,
      additionalServicePrice: null,
      orderTotal: null,
    });

    await this.orderRepository.save(order);

    // Gửi thông báo không chặn luồng chính
    this.sendOrderCreationNotifications(order).catch(error => {
      console.error('Failed to send order notifications:', error);
    });

    return { id: order.id, success: true };
  }

  // Hàm riêng để gửi thông báo khi tạo order
  private async sendOrderCreationNotifications(order: Order): Promise<void> {
    try {
      const notificationContent = `Đơn hàng mới: ${order.projectName} (ID: ${order.id})
Dịch vụ: ${order.service}
Giá: ${order.servicePrice}`;

      // Gửi thông báo cho admin
      await this.notificationService.create({
        title: `Đơn hàng mới: ${order.projectName}`,
        content: notificationContent,
        receiverId: 1, // Admin ID
      });
    } catch (error) {
      console.error('Error sending order notifications:', error);
    }
  }

  async findAll(
    userRequest: User,
    page = 1,
    itemsPerPage = 20,
    sortDesc = true,
    status?: string,
  ) {
    const where: any = {};

    if (userRequest.role === UserRole.USER) {
      where.customerId = userRequest.id;
    } else if (userRequest.role === UserRole.EMPLOYEE) {
      where.assignedId = userRequest.id;
    } else if (
      [UserRole.ADMIN, UserRole.SUPERADMIN].includes(userRequest.role)
    ) {
    } else {
      throw new ForbiddenException();
    }

    if (status) {
      where.status = status;
    }

    const [orders, total] = await this.orderRepository.findAndCount({
      where,
      order: {
        createdTime: sortDesc ? 'DESC' : 'ASC',
      },
      skip: (page - 1) * itemsPerPage,
      take: itemsPerPage,
    });

    return {
      data: {
        count: total,
        list: orders,
      },
    };
  }

  async findOne(userRequest: User, orderId: string) {
    const order = await validateOrderPermission(
      this.orderRepository,
      orderId,
      userRequest,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Success',
      data: order,
    };
  }

  async generateUuid(): Promise<string> {
    const uniqueId = uuidv4();
    return uniqueId;
  }

  async countByStatus(userRequest: User) {
    const where: any = {};

    if (userRequest.role === UserRole.USER) {
      where.customerId = userRequest.id;
    } else if (userRequest.role === UserRole.EMPLOYEE) {
      where.assignedId = userRequest.id;
    } else if (
      [UserRole.ADMIN, UserRole.SUPERADMIN].includes(userRequest.role)
    ) {
    } else {
      throw new ForbiddenException();
    }

    const result = await Promise.all(
      Object.values(OrderStatus).map(async (status) => {
        const count = await this.orderRepository.count({
          where: { ...where, status },
        });
        return { status, count };
      }),
    );

    return result;
  }

  async assignEmployee(
    userRequest: User,
    orderId: string,
    assignEmployeeDto: AssignEmployeeDto,
  ) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Order not found',
      });
    }

    const employee = await this.userRepository.findOne({
      where: { id: assignEmployeeDto.employeeId },
    });

    if (!employee) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'User not found',
      });
    }

    if (employee.role !== UserRole.EMPLOYEE) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'User is not an employee',
      });
    }

    order.assignedId = assignEmployeeDto.employeeId;
    order.updatedUser = userRequest.id;
    order.updatedTime = new Date();

    const updatedOrder = await this.orderRepository.save(order);

    // Gửi thông báo không chặn luồng chính
    this.sendAssignmentNotifications(updatedOrder, employee).catch(error => {
      console.error('Failed to send assignment notifications:', error);
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'Success',
      data: updatedOrder,
    };
  }

  // Hàm riêng để gửi thông báo khi gán nhân viên
  private async sendAssignmentNotifications(order: Order, employee: User): Promise<void> {
    try {
      const notificationContent = `Đơn hàng: ${order.projectName} (ID: ${order.id})
Dịch vụ: ${order.service}
Đã được gán cho bạn`;

      // Gửi thông báo cho nhân viên được gán
      await this.notificationService.create({
        title: `Bạn được gán đơn hàng: ${order.projectName}`,
        content: notificationContent,
        receiverId: employee.id,
      });
    } catch (error) {
      console.error('Error sending assignment notifications:', error);
    }
  }

  async update(orderId: string, userRequest: User, data: UpdateOrderDto) {
    const order = await validateOrderPermission(
      this.orderRepository,
      orderId,
      userRequest,
    );

    // Kiểm tra nếu có thay đổi trạng thái
    const statusChanged = data.status && data.status !== order.status;
    const oldStatus = order.status;

    const updatedOrder = await this.orderRepository.save({
      ...order,
      ...data,
      updatedUser: userRequest.id,
      updatedTime: new Date(),
    });

    // Nếu trạng thái thay đổi, gửi thông báo
    if (statusChanged) {
      this.sendStatusChangeNotifications(updatedOrder, oldStatus).catch(error => {
        console.error('Failed to send status change notifications:', error);
      });
    }

    return {
      statusCode: HttpStatus.OK,
      message: 'Success',
      id: updatedOrder.id,
    };
  }

  // Hàm riêng để gửi thông báo khi trạng thái đơn hàng thay đổi
  private async sendStatusChangeNotifications(order: Order, oldStatus: string): Promise<void> {
    try {
      const notificationContent = `Đơn hàng: ${order.projectName} (ID: ${order.id})
Trạng thái đã thay đổi từ ${oldStatus} thành ${order.status}`;

      // Gửi thông báo cho khách hàng
      await this.notificationService.create({
        title: `Trạng thái đơn hàng đã thay đổi: ${order.projectName}`,
        content: notificationContent,
        receiverId: order.customerId,
      });

      // Gửi thông báo cho nhân viên được gán (nếu có)
      if (order.assignedId) {
        await this.notificationService.create({
          title: `Trạng thái đơn hàng đã thay đổi: ${order.projectName}`,
          content: notificationContent,
          receiverId: order.assignedId,
        });
      }

      // Gửi thông báo cho admin
      await this.notificationService.create({
        title: `Trạng thái đơn hàng đã thay đổi: ${order.projectName}`,
        content: notificationContent,
        receiverId: 1, // Admin ID
      });
    } catch (error) {
      console.error('Error sending status change notifications:', error);
    }
  }

  async remove(userRequest: User, id: string) {
    await validateOrderPermission(this.orderRepository, id, userRequest);

    await this.orderRepository.delete(id);

    return {
      statusCode: HttpStatus.OK,
      message: 'Success',
    };
  }

  async getStatistics() {
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    // Tổng số đơn hàng toàn hệ thống
    const totalOrders = await this.orderRepository.count();

    // Đơn hàng tháng hiện tại
    const currentMonthOrders = await this.orderRepository
      .createQueryBuilder('order')
      .where('order.createdTime >= :currentMonth', { currentMonth })
      .getCount();

    // Đơn hàng tháng trước
    const lastMonthOrders = await this.orderRepository
      .createQueryBuilder('order')
      .where('order.createdTime >= :lastMonth', { lastMonth })
      .andWhere('order.createdTime <= :lastMonthEnd', { lastMonthEnd })
      .getCount();

    // Tính tăng trưởng
    const growth = currentMonthOrders - lastMonthOrders;
    const growthPercent = lastMonthOrders === 0 
      ? (currentMonthOrders > 0 ? 100 : 0)
      : Math.round(((currentMonthOrders - lastMonthOrders) / lastMonthOrders) * 100);

    
    const currentRevenue = await this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.orderTotal)', 'total')
      .where('order.createdTime >= :currentMonth', { currentMonth })
      .andWhere('order.orderTotal IS NOT NULL')
      .andWhere('order.status != :awaitingStatus', { awaitingStatus: OrderStatus.AWAITING })
      .getRawOne();

    const lastRevenue = await this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.orderTotal)', 'total')
      .where('order.createdTime >= :lastMonth', { lastMonth })
      .andWhere('order.createdTime <= :lastMonthEnd', { lastMonthEnd })
      .andWhere('order.orderTotal IS NOT NULL')
      .andWhere('order.status != :awaitingStatus', { awaitingStatus: OrderStatus.AWAITING })
      .getRawOne();

    const currentRevenueValue = parseFloat(currentRevenue?.total || '0');
    const lastRevenueValue = parseFloat(lastRevenue?.total || '0');
    const revenueGrowth = currentRevenueValue - lastRevenueValue;
    const revenueGrowthPercent = lastRevenueValue === 0 
      ? (currentRevenueValue > 0 ? 100 : 0)
      : Math.round(((currentRevenueValue - lastRevenueValue) / lastRevenueValue) * 100);

    return {
      statusCode: HttpStatus.OK,
      message: 'Success',
      data: {
        totalOrders,
        thisMonth: currentMonthOrders,
        lastMonth: lastMonthOrders,
        growth: growth,
        growthPercent: growthPercent,
        isGrowthPositive: growth >= 0,
        revenue: {
          thisMonth: currentRevenueValue,
          lastMonth: lastRevenueValue,
          growth: revenueGrowth,
          growthPercent: revenueGrowthPercent,
          isGrowthPositive: revenueGrowth >= 0,
        },
      },
    };
  }
}
