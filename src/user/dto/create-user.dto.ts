import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEmail, IsOptional, IsEnum } from 'class-validator';
import { UserRole } from '../../common/enum';

export class CreateUserDto {
  @ApiProperty({ required: false })
  avatar?: string;

  @ApiProperty()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ enum: UserRole, required: false, default: UserRole.USER })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiProperty()
  @IsNotEmpty()
  password: string;
}
