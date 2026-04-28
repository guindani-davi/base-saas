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

  public parseEntitiesDates(
    createdAt: string,
    updatedAt: string | null,
  ): { createdAtDate: Date; updatedAtDate: Date | null } {
    const createdAtDate = this.parseDate(createdAt);
    const updatedAtDate = updatedAt ? this.parseDate(updatedAt) : null;

    return { createdAtDate, updatedAtDate };
  }

  public getCurrentTimestampWithoutTZ(): string {
    return this.removeTimestampTZ(new Date());
  }

  public generateUUID(): string {
    return v7();
  }

  public isProduction(): boolean {
    const nodeEnv = this.configService.getOrThrow<Environment>('NODE_ENV');
    return nodeEnv === Environment.PRODUCTION;
  }

  public removeTimestampTZ(date: Date): string {
    return date.toISOString().slice(0, -1);
  }

  private parseDate(date: string): Date {
    return new Date(date);
  }
}
