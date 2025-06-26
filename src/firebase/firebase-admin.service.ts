import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FirebaseAdminService implements OnModuleInit {
  constructor(private config: ConfigService) {}

  onModuleInit() {
    const serviceAccountPath = this.config.get<string>('FIREBASE_PATH');

    const serviceAccount = require(path.resolve(__dirname, serviceAccountPath));

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }

  async sendNotification( fcmToken:string,body: string) {
   

    const message = {
      notification: {
        title: "Thông báo mới",
        body,
      },
      token: fcmToken,
    };

    try {
      const response = await admin.messaging().send(message);
      console.log('✅ Gửi thành công:', response);
    } catch (error) {
      console.error('❌ Gửi thất bại:', error);
    }
  }
}
