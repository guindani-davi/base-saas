import { Environment } from '@base-saas/shared';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v7 } from 'uuid';
import { IHelpersService } from '../i.helpers.service';

@Injectable()
export class HelpersService extends IHelpersService {
  private readonly configService: ConfigService;

  public constructor(@Inject(ConfigService) configService: ConfigService) {
    super();
    this.configService = configService;
  }

  public parseDate(date: string): Date {
    return new Date(date);
  }

  public getCurrentTimestamp(): string {
    return new Date().toISOString();
  }

  public generateUUID(): string {
    return v7();
  }

  public isProduction(): boolean {
    const nodeEnv = this.configService.getOrThrow<Environment>('NODE_ENV');
    return nodeEnv === Environment.PRODUCTION;
  }

  public formatTimestamp(date: Date): string {
    return date.toISOString();
  }
}
