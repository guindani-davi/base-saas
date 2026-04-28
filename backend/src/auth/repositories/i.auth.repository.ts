import { Injectable } from '@nestjs/common';
import { IDatabaseClient } from 'src/database/clients/i.database.client';
import { IHelpersService } from 'src/helpers/services/i.helpers.service';

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
    userId: string,
    tokenHash: string,
  ): Promise<void>;
}
