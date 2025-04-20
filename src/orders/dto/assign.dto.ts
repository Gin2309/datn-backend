import { IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignEmployeeDto {
  @ApiProperty({
    example: '6',
    description: 'Employee ID',
  })
  @IsNumber()
  employeeId: number;
}
