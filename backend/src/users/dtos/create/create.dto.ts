import { CreateBody, User } from '@base-saas/shared';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateBodyDTO implements CreateBody {
  @IsNotEmpty()
  @IsEmail()
  public email: User['email'];

  @IsNotEmpty()
  @IsString()
  public password: User['hashedPassword'];

  @IsNotEmpty()
  @IsString()
  public name: User['name'];

  @IsNotEmpty()
  @IsString()
  public surname: User['surname'];
}
