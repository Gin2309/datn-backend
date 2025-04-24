import { ArrayNotEmpty, IsArray, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty({ example: 'Tiêu đề' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'tieu-de' })
  @IsString()
  slug: string;

  @ApiProperty({ example: 'Mô tả ngắn', required: false })
  @IsOptional()
  @IsString()
  shortDesc?: string;

  @ApiProperty({ example: '<p>Nội dung</p>' })
  @IsString()
  content: string;

  @ApiProperty({ example: '', required: false })
  @IsOptional()
  @IsString()
  thumbnail?: string;

  @ApiProperty({ example: [1] })
  @IsArray()
  @ArrayNotEmpty({ each: true })
  tags: number[];
}
