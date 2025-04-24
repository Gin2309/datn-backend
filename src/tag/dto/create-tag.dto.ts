import { IsString, MaxLength } from 'class-validator';

export class CreateTagDto {
  @IsString()
  name: string;

  @IsString()
  @MaxLength(255)
  slug: string;
}
