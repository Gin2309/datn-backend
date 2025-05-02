import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEmail } from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({ required: false })
  @IsOptional()
  avatar?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  phone?: string;
}
