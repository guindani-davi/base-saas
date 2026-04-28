import { Module } from '@nestjs/common';
import { AuthController } from './controllers/implementations/auth.controller';

@Module({
  controllers: [AuthController],
})
export class AuthModule {}
