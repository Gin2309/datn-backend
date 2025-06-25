import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateNotificationDto {
  @ApiProperty({
    description: 'Tiêu đề thông báo',
    example: 'Thông báo mới',
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Nội dung thông báo',
    example: 'Bạn có một thông báo mới',
  })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty({
    description: 'ID người nhận thông báo',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  receiverId: number;
}
