import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ListingsModule } from './listings/listings.module';
import { BookingsModule } from './bookings/bookings.module';
import { MessagesModule } from './messages/messages.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [UsersModule, ListingsModule, BookingsModule, MessagesModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
