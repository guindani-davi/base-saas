import { GetByEmailParams, GetByIdParams } from '@base-saas/shared';
import { IsEmail, IsNotEmpty, IsUUID } from 'class-validator';

export class GetByIdParamsDTO implements GetByIdParams {
  @IsNotEmpty()
  @IsUUID()
  public id: string;
}

export class GetByEmailParamsDTO implements GetByEmailParams {
  @IsNotEmpty()
  @IsEmail()
  public email: string;
}
