import { CreateUserBody } from '@base-saas/shared';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateUserBodyDTO implements CreateUserBody {
  @IsNotEmpty()
  @IsEmail()
  public email: string;

  @IsNotEmpty()
  @IsString()
  public password: string;

  @IsNotEmpty()
  @IsString()
  public name: string;

  @IsNotEmpty()
  @IsString()
  public surname: string;
}
