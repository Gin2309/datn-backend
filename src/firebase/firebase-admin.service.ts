import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as path from 'path';

@Injectable()
export class FirebaseAdminService implements OnModuleInit {
  onModuleInit() {
    const serviceAccount = require(path.resolve(__dirname, './test-3ae35-firebase-adminsdk-fbsvc-cbf12e0697.json'));

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }

  async sendNotification( body: string) {
    const CLIENT_FCM_TOKEN = 'cpG-j6pnl3WbuK1hihkNIB:APA91bG-Etv-R_9Abd5yeW5Ad1josrPBZYC83eCpUy1qMbmfRgYb0cGeI95is2brN97A2nmb2aGxQuABJ-TV0Zfd-3v01B_4facVbEc9aG113dYetPImM7s'; 

    const message = {
      notification: {
        title: "Thông báo mới",
        body,
      },
      token: CLIENT_FCM_TOKEN,
    };

    try {
      const response = await admin.messaging().send(message);
      console.log('✅ Gửi thành công:', response);
    } catch (error) {
      console.error('❌ Gửi thất bại:', error);
    }
  }
}
