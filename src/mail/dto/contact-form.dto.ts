import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, IsOptional } from "class-validator";

export class ContactFormDto {
  @ApiProperty({
    description: 'Full name of the contact',
    example: 'John Doe'
  })
  @IsNotEmpty()
  @IsString()
  fullname: string;

  @ApiProperty({
    description: 'Email address of the contact',
    example: 'john@example.com'
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Phone number of the contact',
    example: '+84123456789'
  })
  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @ApiProperty({
    description: 'Message content',
    example: 'I would like to inquire about your services'
  })
  @IsNotEmpty()
  @IsString()
  message: string;
}
