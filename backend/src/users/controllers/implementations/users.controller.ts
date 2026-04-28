import { SafeUser } from '@base-saas/shared';
import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ExtractJwtPayload } from '../../../auth/decorators/jwt-payload/jwt-payload.decorator';
import { Public } from '../../../auth/decorators/public/public.decorator';
import type { JwtPayload } from '../../../auth/models/jwt.model';
import { CreateBodyDTO } from '../../../users/dtos/create.dto';
import { UpdateBodyDTO } from '../../../users/dtos/update.dto';
import { IUsersService } from '../../../users/services/i.users.service';
import { IUsersController } from '../i.user.controller';

@Controller('users')
export class UsersController extends IUsersController {
  public constructor(@Inject(IUsersService) userService: IUsersService) {
    super(userService);
  }

  @Post()
  @Public()
  public async createUser(@Body() body: CreateBodyDTO): Promise<SafeUser> {
    return await this.userService.create(body);
  }

  public async getById(
    @ExtractJwtPayload() payload: JwtPayload,
  ): Promise<SafeUser> {
    return await this.userService.getById(payload);
  }

  public updateMe(user: JwtPayload, body: UpdateBodyDTO): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
