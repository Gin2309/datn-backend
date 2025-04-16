import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ required: false })
  avatar?: string;

  @ApiProperty({
    example: 'Nguyen Van A',
  })
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'example@gmail.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '0123456789',
  })
  @IsNotEmpty()
  phone: string;

  @ApiProperty({
    example: '123456',
  })
  @IsNotEmpty()
  password: string;
}
