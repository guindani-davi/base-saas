import { PasswordResetToken, RefreshToken, User } from '@base-saas/shared';
import { Injectable } from '@nestjs/common';
import { IDatabaseClient } from '../../database/clients/i.database.client';
import { IHelpersService } from '../../helpers/services/i.helpers.service';

@Injectable()
export abstract class IAuthRepository {
  protected readonly databaseClient: IDatabaseClient;
  protected readonly helpersService: IHelpersService;

  public constructor(
    databaseClient: IDatabaseClient,
    helpersService: IHelpersService,
  ) {
    this.databaseClient = databaseClient;
    this.helpersService = helpersService;
  }

  public abstract storeRefreshToken(
    userId: User['id'],
    hashedToken: RefreshToken['hashedToken'],
    expiry: number,
  ): Promise<void>;
  public abstract storePasswordResetToken(
    userId: User['id'],
    hashedToken: PasswordResetToken['hashedToken'],
    expiry: number,
  ): Promise<void>;
  public abstract getRefreshTokenByHash(
    hashedToken: RefreshToken['hashedToken'],
  ): Promise<RefreshToken | null>;
  public abstract revokeRefreshTokenById(
    refreshTokenId: RefreshToken['id'],
  ): Promise<void>;
  public abstract revokeRefreshTokenByHash(
    hashedToken: RefreshToken['hashedToken'],
  ): Promise<void>;
  public abstract markPasswordResetTokenAsUsed(
    userId: User['id'],
  ): Promise<void>;
  public abstract getPasswordResetTokenByHash(
    hashedToken: PasswordResetToken['hashedToken'],
  ): Promise<PasswordResetToken | null>;
  public abstract revokeRefreshTokensByUserId(
    userId: User['id'],
  ): Promise<void>;
}
