import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { UserService } from '../user/user.service';
import { RegisterDto } from './dto/register';
import { Roles } from '../common/decorators/roles.decorators';
import { UserRole } from '../common/enum';
import { RolesGuard } from '../common/guards/roles.guard';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('auth')
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

  @Post('/admin/login')
  async adminLogin(@Body() data: LoginDto): Promise<any> {
    return await this.authService.adminLogin(data);
  }

  @Post('/register')
  async create(@Body() createUserDto: RegisterDto) {
    return await this.userService.create(createUserDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Get('/profile')
  async getProfile(@Req() request: any): Promise<any> {
    const token = request.headers.authorization.split(' ')[1];
    const user = await this.authService.verifyToken(token);

    return user;
  }
}
