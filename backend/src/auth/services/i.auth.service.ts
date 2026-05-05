import { TokensResponse } from '@base-saas/shared';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IEmailService } from '../../email/services/i.email.service';
import { IUsersService } from '../../users/services/i.users.service';
import { LoginBodyDTO } from '../dtos/login/login.dto';
import { RunPasswordResetBodyDTO } from '../dtos/password-reset/run/run.dto';
import { StartPasswordResetBodyDTO } from '../dtos/password-reset/start/start.dto';
import { RefreshBodyDTO } from '../dtos/refresh/refresh.dto';
import { IAuthRepository } from '../repositories/i.auth.repository';

@Injectable()
export abstract class IAuthService {
  protected readonly authRepository: IAuthRepository;
  protected readonly userService: IUsersService;
  protected readonly jwtService: JwtService;
  protected readonly emailService: IEmailService;

  public constructor(
    authRepository: IAuthRepository,
    userService: IUsersService,
    jwtService: JwtService,
    emailService: IEmailService,
  ) {
    this.authRepository = authRepository;
    this.userService = userService;
    this.jwtService = jwtService;
    this.emailService = emailService;
  }

  public abstract login(dto: LoginBodyDTO): Promise<TokensResponse>;
  public abstract refresh(dto: RefreshBodyDTO): Promise<TokensResponse>;
  public abstract logout(dto: RefreshBodyDTO): Promise<void>;
  public abstract startPasswordReset(
    dto: StartPasswordResetBodyDTO,
  ): Promise<void>;
  public abstract runPasswordReset(dto: RunPasswordResetBodyDTO): Promise<void>;
}
