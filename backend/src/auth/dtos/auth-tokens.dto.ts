import { AuthTokensResponse } from '@base-saas/shared';
import { IsNotEmpty, IsString } from 'class-validator';

export class AuthTokensResponseDTO implements AuthTokensResponse {
  @IsNotEmpty()
  @IsString()
  public accessToken: string;

  @IsNotEmpty()
  @IsString()
  public refreshToken: string;
}
