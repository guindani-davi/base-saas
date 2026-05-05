import { GetByEmailParams, GetByIdParams, User } from '@base-saas/shared';
import { IsEmail, IsNotEmpty, IsUUID } from 'class-validator';

export class GetByIdParamsDTO implements GetByIdParams {
  @IsNotEmpty()
  @IsUUID()
  public id: User['id'];
}

export class GetByEmailParamsDTO implements GetByEmailParams {
  @IsNotEmpty()
  @IsEmail()
  public email: User['email'];
}
