import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Req,
  Put,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { UserService } from '../user/user.service';
import { RegisterDto } from './dto/register';
import { AdminLoginDto } from './dto/adminLogin.dto';
import { RolesGuard } from '../common/guards/roles.guard';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { getUser } from '../common/decorators/users.decorators';
import { UpdateProfileDto } from './dto/updateProfile.dto';
import { removePassword } from '../utils';

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
  async adminLogin(@Body() data: AdminLoginDto): Promise<any> {
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

    return removePassword(user);
  }

  @Post('refresh-token')
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto.token);
  }

  @Post('change-password')
  async changePassword(
    @getUser() userRequest,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    await this.authService.changePassword(userRequest, changePasswordDto);
    return { message: 'Password changed successfully' };
  }

  @Put('update-profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  async updateProfile(
    @getUser() userRequest,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    await this.authService.updateProfile(userRequest, updateProfileDto);
    return { message: 'Profile updated successfully' };
  }
}
