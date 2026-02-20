import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: true }); // Allow public website (any origin in dev)
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
