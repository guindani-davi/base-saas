import { CreateBody } from '@base-saas/shared';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateBodyDTO implements CreateBody {
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
