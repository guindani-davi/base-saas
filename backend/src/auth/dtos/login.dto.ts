import type { LoginBody } from '@base-saas/shared';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginBodyDTO implements LoginBody {
  @IsNotEmpty()
  @IsEmail()
  public email: string;

  @IsNotEmpty()
  @IsString()
  public password: string;
}
