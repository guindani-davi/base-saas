import { Inject, Injectable } from '@nestjs/common';
import { IDatabaseClient } from 'src/database/clients/i.database.client';
import { IAuthRepository } from '../i.auth.repository';

@Injectable()
export class AuthRepository extends IAuthRepository {
  public constructor(@Inject(IDatabaseClient) databaseClient: IDatabaseClient, @Inject(IHelpersService) helpersService: IHelpersService) {
    super(databaseClient, helpersService);
  }

  public async storeRefreshToken(userId: string, tokenHash: string, expiry: number): Promise<void> {
    const expiresAt = this.helpersService.removeTimestampTZ(new Date(Date.now() + expiry));
    
    await this.databaseClient.from('refresh_tokens').insert({
      user_id: userId,
      token_hash: tokenHash,
      expires_at:
    });
  }
}
