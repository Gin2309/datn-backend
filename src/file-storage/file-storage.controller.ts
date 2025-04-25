import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { FileStorageService } from './file-storage.service';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';

@ApiTags('file Storage')
@Controller('file')
export class FileStorageController {
  constructor(private readonly fileStorageService: FileStorageService) {}

  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './file-storage/uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '_' + file.originalname;
          callback(null, uniqueSuffix);
        },
      }),
    }),
  )
  async upload(@UploadedFile() file: Express.Multer.File) {
    return this.fileStorageService.uploadFile(file);
  }
}
