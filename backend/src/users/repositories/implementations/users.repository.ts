import { User } from '@base-saas/shared';
import { Inject, Injectable } from '@nestjs/common';
import { IDatabaseClient } from '../../../database/clients/i.database.client';
import { PostgresErrorCode } from '../../../database/enums/postgres-error-code.enum';
import { DatabaseException } from '../../../database/exceptions/database.exception';
import { Database } from '../../../database/types';
import { IHelpersService } from '../../../helpers/services/i.helpers.service';
import { CreateBodyDTO } from '../../../users/dtos/create/create.dto';
import {
  GetByEmailParamsDTO,
  GetByIdParamsDTO,
} from '../../../users/dtos/get/get.dto';
import { UpdateBodyDTO, UpdateParamsDTO } from '../../dtos/update/update.dto';
import { IUsersRepository } from '../i.users.repository';

@Injectable()
export class UsersRepository extends IUsersRepository {
  public constructor(
    @Inject(IDatabaseClient) databaseClient: IDatabaseClient,
    @Inject(IHelpersService) helpersService: IHelpersService,
  ) {
    super(databaseClient, helpersService);
  }

  public async create(body: CreateBodyDTO): Promise<User | null> {
    const data: Database['public']['Tables']['users']['Insert'] = {
      id: this.helpersService.generateUUID(),
      email: body.email,
      hashed_password: body.password,
      name: body.name,
      surname: body.surname,
      is_active: true,
      created_at: this.helpersService.getCurrentTimestamp(),
      updated_at: null,
    };

    const result = await this.databaseClient
      .from('users')
      .insert(data)
      .select()
      .single();

    if (result.error) {
      if (result.error.code === PostgresErrorCode.UNIQUE_VIOLATION) {
        return null;
      }
      throw new DatabaseException();
    }

    return this.mapToEntity(result.data);
  }

  public async getById(params: GetByIdParamsDTO): Promise<User | null> {
    const result = await this.databaseClient
      .from('users')
      .select()
      .eq('id', params.id)
      .single();

    if (!result.data) {
      return null;
    }

    return this.mapToEntity(result.data);
  }

  public async getByEmail(params: GetByEmailParamsDTO): Promise<User | null> {
    const result = await this.databaseClient
      .from('users')
      .select()
      .eq('email', params.email)
      .single();

    if (!result.data) {
      return null;
    }

    return this.mapToEntity(result.data);
  }

  public async updateById(
    params: UpdateParamsDTO,
    body: UpdateBodyDTO,
  ): Promise<void> {
    const data: Database['public']['Tables']['users']['Update'] = {
      ...body,
      updated_at: this.helpersService.getCurrentTimestamp(),
    };

    const result = await this.databaseClient
      .from('users')
      .update(data)
      .eq('id', params.id);

    if (result.error) {
      throw new DatabaseException();
    }
  }

  public async updatePasswordById(
    userId: User['id'],
    newPassword: User['hashedPassword'],
  ): Promise<void> {
    const data: Database['public']['Tables']['users']['Update'] = {
      hashed_password: newPassword,
      updated_at: this.helpersService.getCurrentTimestamp(),
    };

    const result = await this.databaseClient
      .from('users')
      .update(data)
      .eq('id', userId);

    if (result.error) {
      throw new DatabaseException();
    }
  }

  private mapToEntity(
    data: Database['public']['Tables']['users']['Row'],
  ): User {
    const createdAt = this.helpersService.parseDate(data.created_at);
    const updatedAt = data.updated_at
      ? this.helpersService.parseDate(data.updated_at)
      : null;

    return new User(
      data.id,
      data.email,
      data.name,
      data.surname,
      data.hashed_password,
      createdAt,
      updatedAt,
    );
  }
}
