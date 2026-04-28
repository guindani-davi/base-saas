import { AuthTokensResponseDto } from '../dtos/auth-tokens.dto';
import { LoginBodyDto } from '../dtos/login.dto';
import { RefreshBodyDTO } from '../dtos/refresh.dto';
import { RequestPasswordResetBodyDTO } from '../dtos/request-password-reset.dto';
import { ResetPasswordBodyDTO } from '../dtos/reset-password.dto';
import { IAuthService } from '../services/i.auth.service';

export abstract class IAuthController {
  protected readonly authService: IAuthService;

  public constructor(authService: IAuthService) {
    this.authService = authService;
  }

  public abstract login(body: LoginBodyDto): Promise<AuthTokensResponseDto>;
  public abstract refresh(body: RefreshBodyDTO): Promise<AuthTokensResponseDto>;
  public abstract logout(body: RefreshBodyDTO): Promise<void>;
  public abstract requestPasswordReset(
    body: RequestPasswordResetBodyDTO,
  ): Promise<void>;
  public abstract resetPassword(body: ResetPasswordBodyDTO): Promise<void>;
}
