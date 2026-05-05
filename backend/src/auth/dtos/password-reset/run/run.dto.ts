import {
  PasswordResetToken,
  RunPasswordResetBody,
  User,
} from '@base-saas/shared';
import { IsNotEmpty, IsString } from 'class-validator';

export class RunPasswordResetBodyDTO implements RunPasswordResetBody {
  @IsNotEmpty()
  @IsString()
  public token: PasswordResetToken['hashedToken'];

  @IsNotEmpty()
  @IsString()
  public newPassword: User['hashedPassword'];
}
