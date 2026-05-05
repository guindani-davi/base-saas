import { JwtPayload, RefreshToken, TokensResponse } from '@base-saas/shared';
import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { RefreshBodyDTO } from '../../../auth/dtos/refresh/refresh.dto';
import { IAuthRepository } from '../../../auth/repositories/i.auth.repository';
import { EntityNotFoundException } from '../../../common/exceptions/domain/implementations/entity-not-found/entity-not-found.exception';
import { IEmailService } from '../../../email/services/i.email.service';
import { IUsersService } from '../../../users/services/i.users.service';
import { LoginBodyDTO } from '../../dtos/login/login.dto';
import { RunPasswordResetBodyDTO } from '../../dtos/password-reset/run/run.dto';
import { StartPasswordResetBodyDTO } from '../../dtos/password-reset/start/start.dto';
import { InvalidCredentialsException } from '../../exceptions/invalid-credentals/invalid-credentials.exception';
import { InvalidRefreshTokenException } from '../../exceptions/invalid-refresh-token/invalid-refresh-token.exception';
import { IAuthService } from '../i.auth.service';

@Injectable()
export class AuthService extends IAuthService {
  private readonly REFRESH_TOKEN_EXPIRY_MS = 7 * 24 * 3600_000;
  private readonly PASSWORD_RESET_TOKEN_EXPIRY_MS = 1 * 3600_000;

  public constructor(
    @Inject(IAuthRepository) authRepository: IAuthRepository,
    @Inject(IUsersService) userService: IUsersService,
    @Inject(JwtService) jwtService: JwtService,
    @Inject(IEmailService) emailService: IEmailService,
  ) {
    super(authRepository, userService, jwtService, emailService);
  }

  public async login(dto: LoginBodyDTO): Promise<TokensResponse> {
    const payload = await this.validateUser(dto);

    const accessToken = await this.jwtService.signAsync(payload);

    const refreshToken = await this.generateToken();

    await this.storeRefreshToken(payload.sub, refreshToken);

    return new TokensResponse(accessToken, refreshToken);
  }

  public async refresh(dto: RefreshBodyDTO): Promise<TokensResponse> {
    const hashedToken = await this.hashToken(dto.refreshToken);

    const storedRefreshToken =
      await this.authRepository.getRefreshTokenByHash(hashedToken);

    if (!storedRefreshToken) {
      throw new InvalidRefreshTokenException();
    }

    await this.authRepository.revokeRefreshTokenById(storedRefreshToken.id);

    const user = await this.userService.getSafeById({
      id: storedRefreshToken.userId,
    });

    const payload: JwtPayload = { sub: user.id };

    const accessToken = await this.jwtService.signAsync(payload);
    const newRefreshToken = await this.generateToken();

    await this.storeRefreshToken(user.id, newRefreshToken);

    return new TokensResponse(accessToken, newRefreshToken);
  }

  public async logout(dto: RefreshBodyDTO): Promise<void> {
    const hashedToken = await this.hashToken(dto.refreshToken);

    await this.authRepository.revokeRefreshTokenByHash(hashedToken);
  }

  public async startPasswordReset(
    dto: StartPasswordResetBodyDTO,
  ): Promise<void> {
    const user = await this.userService.getByEmail({ email: dto.email });

    await this.authRepository.markPasswordResetTokenAsUsed(user.id);

    const token = await this.generateToken();
    const hashedToken = await this.hashToken(token);

    await this.authRepository.storePasswordResetToken(
      user.id,
      hashedToken,
      this.PASSWORD_RESET_TOKEN_EXPIRY_MS,
    );

    await this.emailService.sendPasswordResetEmail(dto.email, token);
  }

  public async runPasswordReset(dto: RunPasswordResetBodyDTO): Promise<void> {
    const hashedToken = await this.hashToken(dto.token);

    const storedToken =
      await this.authRepository.getPasswordResetTokenByHash(hashedToken);

    if (!storedToken) {
      throw new InvalidRefreshTokenException();
    }

    await Promise.all([
      this.authRepository.markPasswordResetTokenAsUsed(storedToken.userId),
      this.userService.updatePasswordById(storedToken.userId, dto.newPassword),
      this.authRepository.revokeRefreshTokensByUserId(storedToken.userId),
    ]);
  }

  private async validateUser(dto: LoginBodyDTO): Promise<JwtPayload> {
    try {
      const returnedUser = await this.userService.getByEmail({
        email: dto.email,
      });

      const passwordsMatch = await this.userService.comparePasswords(
        dto.password,
        returnedUser.hashedPassword,
      );

      if (!passwordsMatch) {
        throw new InvalidCredentialsException();
      }

      return {
        sub: returnedUser.id,
      };
    } catch (error) {
      if (error instanceof EntityNotFoundException) {
        throw new InvalidCredentialsException();
      }

      throw error;
    }
  }

  private async generateToken(): Promise<RefreshToken['hashedToken']> {
    const token = crypto.randomBytes(32).toString('hex');
    return await this.hashToken(token);
  }

  private async storeRefreshToken(
    userId: string,
    token: RefreshToken['hashedToken'],
  ): Promise<void> {
    await this.authRepository.storeRefreshToken(
      userId,
      token,
      this.REFRESH_TOKEN_EXPIRY_MS,
    );
  }

  private async hashToken(token: string): Promise<string> {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
