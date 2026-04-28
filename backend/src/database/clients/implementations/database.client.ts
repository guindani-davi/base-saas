import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IDatabaseClient } from '../i.database.client';

@Injectable()
export class DatabaseClient extends IDatabaseClient {
  public constructor(@Inject(ConfigService) configService: ConfigService) {
    super(
      configService.getOrThrow<string>('SUPABASE_URL'),
      configService.getOrThrow<string>('SUPABASE_SECRET_KEY'),
    );
  }
}
