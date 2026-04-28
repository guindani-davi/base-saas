import { User } from '@base-saas/shared';
import { Injectable } from '@nestjs/common';
import { IDatabaseClient } from '../../database/clients/i.database.client';
import { IHelpersService } from '../../helpers/services/i.helpers.service';
import { CreateBodyDTO } from '../dtos/create.dto';
import { GetByEmailParamsDTO, GetByIdParamsDTO } from '../dtos/get.dto';
import { UpdateBodyDTO, UpdateParamsDTO } from '../dtos/update.dto';

@Injectable()
export abstract class IUsersRepository {
  protected readonly databaseClient: IDatabaseClient;
  protected readonly helpersService: IHelpersService;

  public constructor(
    databaseClient: IDatabaseClient,
    helpersService: IHelpersService,
  ) {
    this.databaseClient = databaseClient;
    this.helpersService = helpersService;
  }

  public abstract create(body: CreateBodyDTO): Promise<User>;
  public abstract getById(params: GetByIdParamsDTO): Promise<User>;
  public abstract getByEmail(params: GetByEmailParamsDTO): Promise<User>;
  public abstract updateById(
    params: UpdateParamsDTO,
    body: UpdateBodyDTO,
  ): Promise<void>;
}
