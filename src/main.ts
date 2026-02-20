import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { static as serveStatic } from 'express';

const uploadsDir = join(process.cwd(), 'uploads');
if (!existsSync(uploadsDir)) {
  mkdirSync(uploadsDir, { recursive: true });
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: true }); // Allow public website (any origin in dev)
  app.use('/uploads', serveStatic(uploadsDir));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
