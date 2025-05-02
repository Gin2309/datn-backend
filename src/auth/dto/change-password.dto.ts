import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  password: string;

  @ApiProperty()
  @IsNotEmpty()
  @MinLength(6)
  newPassword: string;

  @ApiProperty()
  @IsNotEmpty()
  @MinLength(6)
  confirmNewPassword: string;
}
