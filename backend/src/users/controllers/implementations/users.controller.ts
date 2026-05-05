import type { JwtPayload } from '@base-saas/shared';
import { SafeUser } from '@base-saas/shared';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Patch,
  Post,
} from '@nestjs/common';
import { ExtractJwtPayload } from '../../../auth/decorators/jwt-payload/jwt-payload.decorator';
import { Public } from '../../../auth/decorators/public/public.decorator';
import { CreateBodyDTO } from '../../dtos/create/create.dto';
import { GetByIdParamsDTO } from '../../dtos/get/get.dto';
import { UpdateBodyDTO } from '../../dtos/update/update.dto';
import { IUsersService } from '../../services/i.users.service';
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

  @Get('me')
  public getMe(@ExtractJwtPayload() user: JwtPayload): Promise<SafeUser> {
    const dto: GetByIdParamsDTO = { id: user.sub };
    return this.userService.getSafeById(dto);
  }

  @Patch('me')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async updateMe(
    @ExtractJwtPayload() user: JwtPayload,
    @Body() body: UpdateBodyDTO,
  ): Promise<void> {
    const dto: GetByIdParamsDTO = { id: user.sub };
    await this.userService.updateById(dto, body);
  }
}
