import { UpdateBody, UpdateParams, User } from '@base-saas/shared';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateParamsDTO implements UpdateParams {
  @IsNotEmpty()
  @IsString()
  public id: User['id'];
}

export class UpdateBodyDTO implements UpdateBody {
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  public name?: User['name'];

  @IsNotEmpty()
  @IsString()
  @IsOptional()
  public surname?: User['surname'];
}
