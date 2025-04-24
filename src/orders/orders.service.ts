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

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
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

    return { id: order.id, success: true };
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

    return {
      statusCode: HttpStatus.OK,
      message: 'Success',
      data: updatedOrder,
    };
  }

  async update(orderId: string, userRequest: User, data: UpdateOrderDto) {
    const order = await validateOrderPermission(
      this.orderRepository,
      orderId,
      userRequest,
    );

    const updatedOrder = await this.orderRepository.save({
      ...order,
      ...data,
      updatedUser: userRequest.id,
      updatedTime: new Date(),
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'Success',
      id: updatedOrder.id,
    };
  }

  async remove(userRequest: User, id: string) {
    await validateOrderPermission(this.orderRepository, id, userRequest);

    await this.orderRepository.delete(id);

    return {
      statusCode: HttpStatus.OK,
      message: 'Success',
    };
  }
}
