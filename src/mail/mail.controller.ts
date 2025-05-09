import { Controller, Post, Body } from '@nestjs/common';
import { MailService } from './mail.service';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { ContactFormDto } from './dto/contact-form.dto';
import { OrderCompletionDto } from './dto/order-completion.dto';

@ApiTags('mail')
@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('contact')
  @ApiResponse({ 
    status: 200, 
    description: 'Contact form email sent successfully',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        message: { type: 'string', example: 'Email sent successfully' },
        data: { type: 'object' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async sendContactForm(@Body() data: ContactFormDto) {
    return this.mailService.sendContactForm({
      ...data,
      domain: process.env.DOMAIN,
      logoUrl: 'https://funface.vn/wp-content/uploads/2024/11/Logo.png'
    });
  }

  @Post('order-completion')
  @ApiResponse({ 
    status: 200, 
    description: 'Order completion email sent successfully',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        message: { type: 'string', example: 'Email sent successfully' },
        data: { type: 'object' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async sendOrderCompletion(@Body() data: OrderCompletionDto) {
    return this.mailService.sendOrderCompletion({
      ...data,
      domain: process.env.DOMAIN,
      logoUrl: 'https://funface.vn/wp-content/uploads/2024/11/Logo.png'
    });
  }

}
