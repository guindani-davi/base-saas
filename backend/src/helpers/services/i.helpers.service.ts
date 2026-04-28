import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class IHelpersService {
  public constructor() {}

  public abstract parseEntitiesDates(
    createdAt: string,
    updatedAt: string | null,
  ): { createdAtDate: Date; updatedAtDate: Date | null };
  public abstract getCurrentTimestampWithoutTZ(): string;
  public abstract generateUUID(): string;
  public abstract isProduction(): boolean;
  public abstract removeTimestampTZ(date: Date): string;
}
