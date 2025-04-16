import { PartialType } from '@nestjs/swagger';
import { RegisterDto } from './register';

export class UpdateAuthDto extends PartialType(RegisterDto) {}
