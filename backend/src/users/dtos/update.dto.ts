import { UpdateBody, UpdateParams } from '@base-saas/shared';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateParamsDTO implements UpdateParams {
  @IsNotEmpty()
  @IsString()
  public id: string;
}

export class UpdateBodyDTO implements UpdateBody {
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  public name?: string;

  @IsNotEmpty()
  @IsString()
  @IsOptional()
  public surname?: string;
}
