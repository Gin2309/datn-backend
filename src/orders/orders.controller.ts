import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  UseGuards,
  Query,
  Put,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { getUser } from '../common/decorators/users.decorators';
import { Roles } from '../common/decorators/roles.decorators';
import { UserRole } from '../common/enum';
import { AssignEmployeeDto } from './dto/assign.dto';

@ApiTags('orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@getUser() userRequest, @Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(userRequest, createOrderDto);
  }

  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({
    name: 'itemsPerPage',
    required: false,
    type: Number,
    example: 20,
  })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'sortDesc', required: false, type: Boolean })
  @Get()
  async findAll(
    @getUser() userRequest: any,
    @Query('page') page = 1,
    @Query('itemsPerPage') itemsPerPage = 20,
    @Query('sortDesc') sortDesc = true,
    @Query('status') status?: string,
  ) {
    return this.ordersService.findAll(
      userRequest,
      Number(page),
      Number(itemsPerPage),
      sortDesc,
      status,
    );
  }

  @Get('/generate-id')
  async generateUniqueId() {
    const id = await this.ordersService.generateUuid();

    return {
      statusCode: HttpStatus.OK,
      message: 'Success',
      id: id,
    };
  }

  @Get('count-by-status')
  async countByStatus(@getUser() userRequest) {
    return this.ordersService.countByStatus(userRequest);
  }

  @Get(':id')
  findOne(@getUser() userRequest, @Param('id') id: string) {
    return this.ordersService.findOne(userRequest, id);
  }

  @Patch(':id/assign')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  async assignEmployee(
    @Param('id') orderId: string,
    @Body() employeeId: AssignEmployeeDto,
    @getUser() userRequest,
  ) {
    return this.ordersService.assignEmployee(userRequest, orderId, employeeId);
  }

  @Put(':id')
  update(
    @getUser() userRequest,
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    return this.ordersService.update(id, userRequest, updateOrderDto);
  }

  @Delete(':id')
  remove(@getUser() userRequest, @Param('id') id: string) {
    return this.ordersService.remove(userRequest, id);
  }
}
