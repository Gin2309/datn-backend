import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, IsNumber, IsDateString } from "class-validator";

export class OrderCompletionDto {
  @ApiProperty({
    description: 'Order ID',
    example: 'ORD123456'
  })
  @IsNotEmpty()
  @IsString()
  orderId: string;

  @ApiProperty({
    description: 'Customer email',
    example: 'customer@example.com'
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Service name',
    example: 'Basic Package'
  })
  @IsNotEmpty()
  @IsString()
  service: string;

  @ApiProperty({
    description: 'Design style',
    example: 'Modern'
  })
  @IsNotEmpty()
  @IsString()
  designStyle: string;

  @ApiProperty({
    description: 'Additional services',
    example: 'Express Delivery'
  })
  @IsNotEmpty()
  @IsString()
  additionalService: string;

  @ApiProperty({
    description: 'Order total amount',
    example: 1000000
  })
  @IsNotEmpty()
  @IsNumber()
  orderTotal: number;

  @ApiProperty({
    description: 'Order creation time',
    example: '2024-03-08T10:00:00Z'
  })
  @IsNotEmpty()
  @IsDateString()
  createdTime: string;
}
