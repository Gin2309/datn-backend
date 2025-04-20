import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateOrderDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  projectName?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  service?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  uploadImage?: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  servicePrice?: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  designStyle?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  photoDetail?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  photoCompleted?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  additionalService?: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  additionalServicePrice?: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  orderTotal?: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  isAgreed?: number;
}
