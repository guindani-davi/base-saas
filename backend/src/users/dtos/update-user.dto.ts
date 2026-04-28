import { UpdateUserBody } from '@base-saas/shared';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateUserBodyDTO implements UpdateUserBody {
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  public name?: string;

  @IsNotEmpty()
  @IsString()
  @IsOptional()
  public surname?: string;
}
