import {
  ForbiddenException,
  NotFoundException,
  HttpStatus,
} from '@nestjs/common';
import { User } from '../user/entities/user.entity';
import { Order } from '../orders/entities/order.entity';
import { UserRole } from '../common/enum';

export async function validateOrderPermission(
  orderRepository: any,
  orderId: string,
  userRequest: User,
): Promise<Order> {
  const order = await orderRepository.findOne({ where: { id: orderId } });

  if (!order) {
    throw new NotFoundException({
      statusCode: HttpStatus.NOT_FOUND,
      message: 'Order not found',
    });
  }

  const isOwner = order.customerId === userRequest.id;
  const isAdmin = [UserRole.ADMIN, UserRole.SUPERADMIN].includes(
    userRequest.role,
  );
  const isAssigned = order.assignedId === userRequest.id;

  if (!isOwner && !isAdmin && !isAssigned) {
    throw new ForbiddenException(
      'You do not have permission to access this order',
    );
  }

  return order;
}
