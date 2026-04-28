import { forwardRef, Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { HelpersModule } from '../helpers/helpers.module';
import { UsersController } from './controllers/implementations/users.controller';

@Module({
  controllers: [UsersController],
  imports: [DatabaseModule, HelpersModule, forwardRef(() => AuthModule)],
  providers: [],
  exports: [],
})
export class UsersModule {}
