import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpStatus } from '@nestjs/common';

@Injectable()
export class FileStorageService {
  constructor(private configService: ConfigService) {}

  async uploadFile(file: Express.Multer.File) {
    const baseUrl = this.configService.get('BASE_URL');
    const fileUrl = `${baseUrl}/file-storage/view/${file.filename}`;

    return {
      statusCode: HttpStatus.OK,
      message: 'Success',
      data: fileUrl,
    };
  }
}
