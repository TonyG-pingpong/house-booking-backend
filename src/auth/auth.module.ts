import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { LocalStrategy } from './local.strategy';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from './jwt.guard';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: 'supersecretjwtkey',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    LocalStrategy,
    PrismaService,
    JwtAuthGuard,   // ← this was missing
  ],
  exports: [AuthService, JwtAuthGuard],
})
export class AuthModule {}