import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { OrdersModule } from './orders/orders.module';
import { PostModule } from './post/post.module';
import { TagModule } from './tag/tag.module';
import { FeedbackModule } from './feedback/feedback.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
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
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
