import { Controller } from '@nestjs/common';
import { LoginBodyDto } from 'src/auth/dtos/login.dto';
import { RefreshTokenDTO } from 'src/auth/dtos/refresh.dto';
import { RequestPasswordResetDTO } from 'src/auth/dtos/request-password-reset.dto';
import { ResetPasswordDTO } from 'src/auth/dtos/reset-password.dto';
import { IAuthController } from '../i.auth.controller';

@Controller('auth')
export class AuthController extends IAuthController {
  public login(body: LoginBodyDto): Promise<AuthTokensResponse> {
    throw new Error('Method not implemented.');
  }
  public refresh(body: RefreshTokenDTO): Promise<AuthTokensResponse> {
    throw new Error('Method not implemented.');
  }
  public logout(body: RefreshTokenDTO): Promise<void> {
    throw new Error('Method not implemented.');
  }
  public requestPasswordReset(body: RequestPasswordResetDTO): Promise<void> {
    throw new Error('Method not implemented.');
  }
  public resetPassword(body: ResetPasswordDTO): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
