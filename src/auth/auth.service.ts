import * as bcrypt from 'bcrypt';
import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { LoginDto } from './dto/login.dto';
import { UserRole } from '../common/enum';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/updateProfile.dto';
import { removePassword } from '../utils';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async signToken(user: { id: any; email: string; role: string }) {
    const payload = { id: user.id, email: user.email, role: user.role };
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '1d',
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
    });

    const expiredAt = Math.floor(Date.now() / 1000) + 86400;

    return {
      accessToken,
      refreshToken,
      expiredAt,
    };
  }

  async login(loginDto: LoginDto): Promise<any> {
    const user = await this.userService.findOneByEmail(loginDto.email);

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userData } = user;

    const tokens = await this.signToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      ...userData,
      ...tokens,
    };
  }

  async adminLogin(loginDto: LoginDto): Promise<any> {
    const user = await this.userService.findOneByEmail(loginDto.email);

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.role === UserRole.USER) {
      throw new ForbiddenException();
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userData } = user;

    const tokens = await this.signToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      ...userData,
      ...tokens,
    };
  }

  async verifyToken(token: string): Promise<any> {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.userService.findOneByEmail(payload.email);

      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      return user;
    } catch (error) {
      throw new HttpException('Invalid Token', HttpStatus.UNAUTHORIZED);
    }
  }

  async refreshToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);

      const userPayload = {
        id: payload.id,
        email: payload.email,
        role: payload.role,
      };

      const accessToken = await this.jwtService.signAsync(userPayload, {
        expiresIn: '1d',
      });

      const refreshToken = await this.jwtService.signAsync(userPayload, {
        expiresIn: '7d',
      });

      const decodedAccessToken = this.jwtService.decode(accessToken) as any;

      return {
        accessToken,
        refreshToken,
        expiredAt: decodedAccessToken.exp,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async changePassword(
    userRequest: any,
    changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    const { password, newPassword, confirmNewPassword } = changePasswordDto;

    const user = await this.userService.findOneById(userRequest.id);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    if (newPassword !== confirmNewPassword) {
      throw new BadRequestException(
        'New password and confirm password do not match',
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.userService.update(userRequest.id, { password: hashedPassword });
  }

  async updateProfile(
    userRequest: any,
    updateProfileDto: UpdateProfileDto,
  ): Promise<any> {
    const user = await this.userService.findOneById(userRequest.id);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    await this.userService.update(userRequest.id, updateProfileDto);

    const updatedUser = await this.userService.findOneById(userRequest.id);

    return {
      data: removePassword(updatedUser),
    };
  }
}
