import { forwardRef, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import type { StringValue } from 'ms';
import { DatabaseModule } from '../database/database.module';
import { EmailModule } from '../email/email.module';
import { HelpersModule } from '../helpers/helpers.module';
import { UsersModule } from '../users/users.module';
import { AuthController } from './controllers/implementations/auth.controller';
import { JwtGuard } from './guards/jwt/jwt.guard';
import { IAuthRepository } from './repositories/i.auth.repository';
import { AuthRepository } from './repositories/implementations/auth.repository';
import { IAuthService } from './services/i.auth.service';
import { AuthService } from './services/implementations/auth.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.getOrThrow<string>(
            'JWT_DURATION',
          ) as StringValue,
          issuer: 'base-saas',
          audience: 'base-saas-api',
        },
      }),
    }),
    forwardRef(() => UsersModule),
    DatabaseModule,
    HelpersModule,
    EmailModule,
  ],
  providers: [
    {
      provide: IAuthRepository,
      useClass: AuthRepository,
    },
    {
      provide: IAuthService,
      useClass: AuthService,
    },
    JwtGuard,
  ],
  controllers: [AuthController],
  exports: [IAuthService, JwtGuard, JwtModule],
})
export class AuthModule {}
