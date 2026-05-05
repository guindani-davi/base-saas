import { TokensResponse } from '@base-saas/shared';
import { LoginBodyDTO } from '../dtos/login/login.dto';
import { RunPasswordResetBodyDTO } from '../dtos/password-reset/run/run.dto';
import { StartPasswordResetBodyDTO } from '../dtos/password-reset/start/start.dto';
import { RefreshBodyDTO } from '../dtos/refresh/refresh.dto';
import { IAuthService } from '../services/i.auth.service';

export abstract class IAuthController {
  protected readonly authService: IAuthService;

  public constructor(authService: IAuthService) {
    this.authService = authService;
  }

  public abstract login(body: LoginBodyDTO): Promise<TokensResponse>;
  public abstract refresh(body: RefreshBodyDTO): Promise<TokensResponse>;
  public abstract logout(body: RefreshBodyDTO): Promise<void>;
  public abstract startPasswordReset(
    body: StartPasswordResetBodyDTO,
  ): Promise<void>;
  public abstract runPasswordReset(
    body: RunPasswordResetBodyDTO,
  ): Promise<void>;
}
