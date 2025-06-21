import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useLogger(app.get(Logger));
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.use(cookieParser());
  const configService = app.get(ConfigService);
  const origin =
    configService.get<string>('ORIGIN') || 'https://shoppy-ui.ginigo.dev';
  app.enableCors({ origin, credentials: true });
  await app.listen(app.get(ConfigService).getOrThrow('PORT'), '127.0.0.1');
  console.log(`🚀 Application is running on: ${await app.getUrl()}`);
}
bootstrap();
