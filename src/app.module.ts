import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { UserModule } from './user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { OrdersModule } from './orders/orders.module';
import { PostModule } from './post/post.module';
import { TagModule } from './tag/tag.module';
import { FeedbackModule } from './feedback/feedback.module';
import { FileStorageModule } from './file-storage/file-storage.module';
import { FirebaseModule } from './firebase/firebase.module';
import { join } from 'path';
import { MailModule } from './mail/mail.module';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'file-storage', 'uploads'),
      serveRoot: '/file-storage/view',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
    AuthModule,
    UserModule,
    OrdersModule,
    PostModule,
    TagModule,
    FeedbackModule,
    FileStorageModule,
    MailModule,
    FirebaseModule,
    NotificationModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
