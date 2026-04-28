import { LoginBodyDTO } from '../dtos/login.dto';
import { RefreshBodyDTO } from '../dtos/refresh.dto';
import { TokensResponseDTO } from '../dtos/tokens.dto';
import { IAuthService } from '../services/i.auth.service';

export abstract class IAuthController {
  protected readonly authService: IAuthService;

  public constructor(authService: IAuthService) {
    this.authService = authService;
  }

  public abstract login(body: LoginBodyDTO): Promise<TokensResponseDTO>;
  public abstract refresh(body: RefreshBodyDTO): Promise<TokensResponseDTO>;
  public abstract logout(body: RefreshBodyDTO): Promise<void>;
}
