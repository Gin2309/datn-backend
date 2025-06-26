import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SaveFcmTokenDto {
  @ApiProperty({
    description: 'FCM token của thiết bị',
    example: 'eYj3k5L7zUKWJsWsS3Kn:APA91bF8...',
  })
  @IsNotEmpty()
  @IsString()
  token: string;
} 