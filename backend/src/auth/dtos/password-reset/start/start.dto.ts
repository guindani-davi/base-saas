import { StartPasswordResetBody, User } from '@base-saas/shared';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class StartPasswordResetBodyDTO implements StartPasswordResetBody {
  @IsNotEmpty()
  @IsEmail()
  public email: User['email'];
}
