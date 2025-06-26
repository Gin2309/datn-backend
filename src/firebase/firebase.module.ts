import { Module } from '@nestjs/common';
import { FirebaseAdminService } from './firebase-admin.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [FirebaseAdminService],
  exports: [FirebaseAdminService],
})
export class FirebaseModule {}
