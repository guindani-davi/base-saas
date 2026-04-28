import { TokensResponse } from '@base-saas/shared';
import { IsNotEmpty, IsString } from 'class-validator';

export class TokensResponseDTO implements TokensResponse {
  @IsNotEmpty()
  @IsString()
  public accessToken: string;

  @IsNotEmpty()
  @IsString()
  public refreshToken: string;
}
