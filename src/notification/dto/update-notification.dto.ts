import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateNotificationDto {
  @ApiProperty({
    description: 'Tiêu đề thông báo',
    example: 'Thông báo mới',
    required: false,
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    description: 'Nội dung thông báo',
    example: 'Bạn có một thông báo mới',
    required: false,
  })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({
    description: 'Trạng thái đã đọc',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isRead?: boolean;
}
