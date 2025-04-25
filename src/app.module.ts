import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { OrdersModule } from './orders/orders.module';
import { PostModule } from './post/post.module';
import { TagModule } from './tag/tag.module';
import { FeedbackModule } from './feedback/feedback.module';
import { FileStorageModule } from './file-storage/file-storage.module';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'file-storage', 'uploads'),
      serveRoot: '/file-storage/view',
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: '160.191.244.248',
      port: 3310,
      username: 'vamedi',
      password: 'vamedi@1234',
      database: 'vamedi',
      autoLoadEntities: true,
      entities: [],
      synchronize: true,
    }),
    AuthModule,
    UserModule,
    OrdersModule,
    PostModule,
    TagModule,
    FeedbackModule,
    FileStorageModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
