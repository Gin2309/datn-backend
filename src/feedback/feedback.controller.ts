import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('feedbacks')
@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  create(@Body() createFeedbackDto: CreateFeedbackDto) {
    return this.feedbackService.create(createFeedbackDto);
  }

  @ApiQuery({ name: 'orderId', required: false, type: String })
  @Get()
  findAll(@Query('orderId') orderId?: string) {
    return this.feedbackService.findAll(orderId);
  }

  @ApiQuery({ name: 'assignId', required: true, type: Number })
  @Get('by-assign')
  findByAssignId(@Query('assignId') assignId: number) {
    return this.feedbackService.findByAssignId(assignId);
  }
}
