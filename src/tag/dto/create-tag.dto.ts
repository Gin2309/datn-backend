import { IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTagDto {
  @ApiProperty({ example: 'Tag A' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'tag-a' })
  @IsString()
  @MaxLength(255)
  slug: string;
}
