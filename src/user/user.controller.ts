import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { UserRole } from '../common/enum';
import { Roles } from '../common/decorators/roles.decorators';
import { SaveFcmTokenDto } from './dto/save-fcm-token.dto';
import { getUser } from '../common/decorators/users.decorators';


@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.userService.create(createUserDto);
  }

  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({
    name: 'itemsPerPage',
    required: false,
    type: Number,
    example: 20,
  })
  @ApiQuery({ name: 'sortDesc', required: false, type: Boolean })
  @Get()
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  async findAll(
    @Query('page') page = 1,
    @Query('itemsPerPage') itemsPerPage = 20,
    @Query('sortDesc') sortDesc = true,
  ) {
    const list = await this.userService.findAll(
      Number(page),
      Number(itemsPerPage),
      sortDesc,
    );
    const total = await this.userService.count();

    return {
      data: {
        count: total,
        list: list,
      },
    };
  }

  @Get('employees')
  async getEmployees() {
    const list = await this.userService.findEmployees();
    return {
      statusCode: HttpStatus.OK,
      message: 'Success',
      data: list,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return {
      data: await this.userService.findOne(+id),
    };
  }
  
  @Post('fcm-token')
   async saveFcmToken(@getUser() userRequest, @Body() dto: SaveFcmTokenDto) {
    const userId = userRequest.user?.id;
    return this.userService.saveFcmToken(userId, dto);
  }

  @Put(':id')
  async updateUser(
    @Param('id') id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  async deleteUser(@Param('id') id: number) {
    await this.userService.remove(id);
    return {
      statusCode: 200,
      message: 'Success',
    };
  }
}
