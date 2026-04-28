import type { ResetPasswordBody } from '@base-saas/shared';
import { IsNotEmpty, IsString } from 'class-validator';

export class ResetPasswordBodyDTO implements ResetPasswordBody {
  @IsNotEmpty()
  @IsString()
  public token: string;

  @IsNotEmpty()
  @IsString()
  public newPassword: string;
}
