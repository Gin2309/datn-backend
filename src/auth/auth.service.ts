import * as bcrypt from 'bcrypt';
import {
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
}
