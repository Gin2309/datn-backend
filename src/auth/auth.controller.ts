import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { UserService } from '../user/user.service';
import { RegisterDto } from './dto/register';

@ApiTags('auth')
@ApiBearerAuth()
@Controller('')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post('/login')
  async login(@Body() data: LoginDto): Promise<any> {
    return await this.authService.login(data);
  }

  @Post('admin/login')
  async adminLogin(@Body() data: LoginDto): Promise<any> {
    return await this.authService.login(data);
  }

  @Post('/register')
  async create(@Body() createUserDto: RegisterDto) {
    return await this.userService.create(createUserDto);
  }
}
