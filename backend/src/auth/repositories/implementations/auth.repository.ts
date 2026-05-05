import { PasswordResetToken, RefreshToken, User } from '@base-saas/shared';
import { Inject, Injectable } from '@nestjs/common';
import { IDatabaseClient } from '../../../database/clients/i.database.client';
import { Database } from '../../../database/types';
import { IHelpersService } from '../../../helpers/services/i.helpers.service';
import { IAuthRepository } from '../i.auth.repository';

@Injectable()
export class AuthRepository extends IAuthRepository {
  public constructor(
    @Inject(IDatabaseClient) databaseClient: IDatabaseClient,
    @Inject(IHelpersService) helpersService: IHelpersService,
  ) {
    super(databaseClient, helpersService);
  }

  public async storeRefreshToken(
    userId: User['id'],
    hashedToken: RefreshToken['hashedToken'],
    expiry: number,
  ): Promise<void> {
    const expiresAt = this.helpersService.formatTimestamp(
      new Date(Date.now() + expiry),
    );

    await this.databaseClient.from('refresh_tokens').insert({
      id: this.helpersService.generateUUID(),
      user_id: userId,
      hashed_token: hashedToken,
      expires_at: expiresAt,
      revoked_at: null,
      created_at: this.helpersService.getCurrentTimestamp(),
    });
  }

  public async storePasswordResetToken(
    userId: User['id'],
    hashedToken: PasswordResetToken['hashedToken'],
    expiry: number,
  ): Promise<void> {
    const expiresAt = this.helpersService.formatTimestamp(
      new Date(Date.now() + expiry),
    );

    await this.databaseClient.from('password_reset_tokens').insert({
      id: this.helpersService.generateUUID(),
      user_id: userId,
      hashed_token: hashedToken,
      expires_at: expiresAt,
      used_at: null,
      created_at: this.helpersService.getCurrentTimestamp(),
    });
  }

  public async getRefreshTokenByHash(
    hashedToken: RefreshToken['hashedToken'],
  ): Promise<RefreshToken | null> {
    const result = await this.databaseClient
      .from('refresh_tokens')
      .select()
      .eq('hashed_token', hashedToken)
      .is('revoked_at', null)
      .gt('expires_at', this.helpersService.getCurrentTimestamp())
      .single();

    if (!result.data) {
      return null;
    }

    return this.mapToRefreshTokenEntity(result.data);
  }

  public async revokeRefreshTokenById(
    refreshTokenId: RefreshToken['id'],
  ): Promise<void> {
    await this.databaseClient
      .from('refresh_tokens')
      .update({ revoked_at: new Date().toISOString() })
      .eq('id', refreshTokenId);
  }

  public async revokeRefreshTokenByHash(
    hashedToken: RefreshToken['hashedToken'],
  ): Promise<void> {
    await this.databaseClient
      .from('refresh_tokens')
      .update({ revoked_at: new Date().toISOString() })
      .eq('hashed_token', hashedToken);
  }

  public async markPasswordResetTokenAsUsed(userId: User['id']): Promise<void> {
    await this.databaseClient
      .from('password_reset_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('user_id', userId)
      .is('used_at', null);
  }

  public async getPasswordResetTokenByHash(
    hashedToken: PasswordResetToken['hashedToken'],
  ): Promise<PasswordResetToken | null> {
    const result = await this.databaseClient
      .from('password_reset_tokens')
      .select()
      .eq('hashed_token', hashedToken)
      .is('used_at', null)
      .gt('expires_at', this.helpersService.getCurrentTimestamp())
      .single();

    if (!result.data) {
      return null;
    }

    return this.mapToPasswordResetTokenEntity(result.data);
  }

  public async revokeRefreshTokensByUserId(userId: User['id']): Promise<void> {
    await this.databaseClient
      .from('refresh_tokens')
      .update({ revoked_at: new Date().toISOString() })
      .eq('user_id', userId)
      .is('revoked_at', null);
  }

  private mapToRefreshTokenEntity(
    data: Database['public']['Tables']['refresh_tokens']['Row'],
  ): RefreshToken {
    const createdAt = this.helpersService.parseDate(data.created_at);
    const expiresAt = this.helpersService.parseDate(data.expires_at);
    const revokedAt = data.revoked_at
      ? this.helpersService.parseDate(data.revoked_at)
      : null;

    return new RefreshToken(
      data.id,
      data.user_id,
      data.hashed_token,
      expiresAt,
      revokedAt,
      createdAt,
    );
  }

  private mapToPasswordResetTokenEntity(
    data: Database['public']['Tables']['password_reset_tokens']['Row'],
  ): PasswordResetToken {
    const createdAt = this.helpersService.parseDate(data.created_at);
    const expiresAt = this.helpersService.parseDate(data.expires_at);
    const usedAt = data.used_at
      ? this.helpersService.parseDate(data.used_at)
      : null;

    return new PasswordResetToken(
      data.id,
      data.user_id,
      data.hashed_token,
      expiresAt,
      usedAt,
      createdAt,
    );
  }
}
