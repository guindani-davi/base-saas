import { SafeUser, User } from '@base-saas/shared';
import { Injectable } from '@nestjs/common';
import { IHelpersService } from '../../helpers/services/i.helpers.service';
import { CreateBodyDTO } from '../dtos/create.dto';
import { GetByEmailParamsDTO, GetByIdParamsDTO } from '../dtos/get.dto';
import { UpdateBodyDTO, UpdateParamsDTO } from '../dtos/update.dto';
import { IUsersRepository } from '../repositories/i.users.repository';

@Injectable()
export abstract class IUsersService {
  protected readonly usersRepository: IUsersRepository;
  protected readonly helperService: IHelpersService;

  public constructor(
    usersRepository: IUsersRepository,
    helperService: IHelpersService,
  ) {
    this.usersRepository = usersRepository;
    this.helperService = helperService;
  }

  public abstract create(body: CreateBodyDTO): Promise<SafeUser>;
  public abstract getSafeById(params: GetByIdParamsDTO): Promise<SafeUser>;
  public abstract getByEmail(params: GetByEmailParamsDTO): Promise<User>;
  public abstract updateById(
    params: UpdateParamsDTO,
    body: UpdateBodyDTO,
  ): Promise<void>;
  public abstract comparePasswords(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean>;
}
