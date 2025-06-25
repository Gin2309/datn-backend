import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { ReadNotificationsDto } from './dto/read-notifications.dto';

@ApiTags('notifications')
@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationService.create(createNotificationDto);
  }

  @ApiQuery({ name: 'receiverId', required: false, type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'size', required: false, type: Number, description: 'Items per page (default: 10)' })
  @Get()
  findAll(
    @Query('receiverId', new ParseIntPipe({ optional: true })) receiverId?: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('size', new DefaultValuePipe(10), ParseIntPipe) size = 10,
  ) {
    return this.notificationService.findAll(receiverId, page, size);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.notificationService.findOne(id);
  }

  @Post('read-by-ids')
  findByIds(@Body() readNotificationsDto: ReadNotificationsDto) {
    return this.notificationService.findByIds(readNotificationsDto);
  }

  @Post('mark-as-read')
  markAsRead(@Body() readNotificationsDto: ReadNotificationsDto) {
    return this.notificationService.markAsRead(readNotificationsDto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateNotificationDto: UpdateNotificationDto,
  ) {
    return this.notificationService.update(id, updateNotificationDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.notificationService.remove(id);
  }
}
