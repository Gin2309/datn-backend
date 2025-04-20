import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtConfigModule } from './jwt.module';
import { UserModule } from '../user/user.module';
import { JwtStrategy } from './jwt.startegy';

@Module({
  imports: [UserModule, JwtConfigModule],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
