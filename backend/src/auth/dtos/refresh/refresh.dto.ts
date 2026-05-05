import type { RefreshBody, RefreshToken } from '@base-saas/shared';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshBodyDTO implements RefreshBody {
  @IsNotEmpty()
  @IsString()
  public refreshToken: RefreshToken['hashedToken'];
}
