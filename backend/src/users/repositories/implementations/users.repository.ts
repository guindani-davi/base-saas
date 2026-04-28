import { User } from '@base-saas/shared';
import { Inject, Injectable } from '@nestjs/common';
import { EntityAlreadyExistsException } from '../../../common/exceptions/entity-already-exists.exception';
import { EntityNotFoundException } from '../../../common/exceptions/entity-not-found.exception';
import { IDatabaseClient } from '../../../database/clients/i.database.client';
import { PostgresErrorCode } from '../../../database/enums/postgres-error-code.enum';
import { DatabaseException } from '../../../database/exceptions/database.exception';
import { Database } from '../../../database/types';
import { IHelpersService } from '../../../helpers/services/i.helpers.service';
import { CreateBodyDTO } from '../../../users/dtos/create.dto';
import {
  GetByEmailParamsDTO,
  GetByIdParamsDTO,
} from '../../../users/dtos/get.dto';
import { UpdateBodyDTO, UpdateParamsDTO } from '../../../users/dtos/update.dto';
import { IUsersRepository } from '../i.users.repository';

@Injectable()
export class UsersRepository extends IUsersRepository {
  public constructor(
    @Inject(IDatabaseClient) databaseClient: IDatabaseClient,
    @Inject(IHelpersService) helpersService: IHelpersService,
  ) {
    super(databaseClient, helpersService);
  }

  public async create(body: CreateBodyDTO): Promise<User> {
    const data: Database['public']['Tables']['users']['Insert'] = {
      id: this.helpersService.generateUUID(),
      email: body.email,
      hashed_password: body.password,
      name: body.name,
      surname: body.surname,
      is_active: true,
      created_at: this.helpersService.getCurrentTimestampWithoutTZ(),
      updated_at: null,
    };

    const result = await this.databaseClient
      .from('users')
      .insert(data)
      .select()
      .single();

    if (result.error) {
      if (result.error.code === PostgresErrorCode.UNIQUE_VIOLATION) {
        throw new EntityAlreadyExistsException('User');
      }
      throw new DatabaseException();
    }

    return this.mapToEntity(result.data);
  }

  public async getById(params: GetByIdParamsDTO): Promise<User> {
    const result = await this.databaseClient
      .from('users')
      .select()
      .eq('id', params.id)
      .single();

    if (!result.data) {
      throw new EntityNotFoundException('User');
    }

    return this.mapToEntity(result.data);
  }

  public async getByEmail(params: GetByEmailParamsDTO): Promise<User> {
    const result = await this.databaseClient
      .from('users')
      .select()
      .eq('email', params.email)
      .single();

    if (!result.data) {
      throw new EntityNotFoundException('User');
    }

    return this.mapToEntity(result.data);
  }

  public async updateById(
    params: UpdateParamsDTO,
    body: UpdateBodyDTO,
  ): Promise<void> {
    const data: Database['public']['Tables']['users']['Update'] = {
      ...body,
      updated_at: this.helpersService.getCurrentTimestampWithoutTZ(),
    };

    const result = await this.databaseClient
      .from('users')
      .update(data)
      .eq('id', params.id);

    if (result.error) {
      throw new DatabaseException();
    }
  }

  private mapToEntity(
    data: Database['public']['Tables']['users']['Row'],
  ): User {
    const { createdAtDate, updatedAtDate } =
      this.helpersService.parseEntitiesDates(data.created_at, data.updated_at);

    return new User(
      data.id,
      data.email,
      data.name,
      data.surname,
      data.hashed_password,
      createdAtDate,
      updatedAtDate,
    );
  }
}
