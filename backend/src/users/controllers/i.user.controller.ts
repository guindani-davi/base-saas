import type { JwtPayload } from '@base-saas/shared';
import { SafeUser } from '@base-saas/shared';
import { CreateBodyDTO } from '../dtos/create/create.dto';
import { UpdateBodyDTO } from '../dtos/update/update.dto';
import { IUsersService } from '../services/i.users.service';

export abstract class IUsersController {
  protected readonly userService: IUsersService;

  public constructor(userService: IUsersService) {
    this.userService = userService;
  }

  public abstract createUser(body: CreateBodyDTO): Promise<SafeUser>;
  public abstract getMe(user: JwtPayload): Promise<SafeUser>;
  public abstract updateMe(
    user: JwtPayload,
    body: UpdateBodyDTO,
  ): Promise<void>;
}
