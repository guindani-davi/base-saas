import type { RequestPasswordResetBody } from '@base-saas/shared';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class RequestPasswordResetBodyDTO implements RequestPasswordResetBody {
  @IsNotEmpty()
  @IsEmail()
  public email: string;
}
