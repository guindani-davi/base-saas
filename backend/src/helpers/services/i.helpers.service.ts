import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class IHelpersService {
  public constructor() {}

  public abstract parseDate(date: string): Date;
  public abstract getCurrentTimestamp(): string;
  public abstract generateUUID(): string;
  public abstract isProduction(): boolean;
  public abstract formatTimestamp(date: Date): string;
}
