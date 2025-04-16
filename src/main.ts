import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: console });
  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('Vamedi API')
    .setDescription('API template')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3017;
  await app.listen(port);
  const url = `http://127.0.0.1:${port}/api`;

  console.log('================================================');
  console.info('SERVER IS RUNNING ON', url);
  console.log('================================================');
}
bootstrap();
