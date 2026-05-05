import type { LoginBody, User } from '@base-saas/shared';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginBodyDTO implements LoginBody {
  @IsNotEmpty()
  @IsEmail()
  public email: User['email'];

  @IsNotEmpty()
  @IsString()
  public password: User['hashedPassword'];
}
