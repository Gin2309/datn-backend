import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class ReadNotificationsDto {
  @ApiProperty({
    description: 'Danh sách ID thông báo cần đọc',
    example: [1, 2, 3],
    type: [Number],
  })
  @IsNotEmpty()
  @IsArray()
  @IsNumber({}, { each: true })
  @Type(() => Number)
  ids: number[];
} 