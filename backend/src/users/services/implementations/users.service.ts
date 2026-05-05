import { SafeUser, User } from '@base-saas/shared';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { EntityAlreadyExistsException } from '../../../common/exceptions/domain/implementations/entity-already-exists/entity-already-exists.exception';
import { EntityNotFoundException } from '../../../common/exceptions/domain/implementations/entity-not-found/entity-not-found.exception';
import { IHelpersService } from '../../../helpers/services/i.helpers.service';
import { CreateBodyDTO } from '../../dtos/create/create.dto';
import { GetByEmailParamsDTO, GetByIdParamsDTO } from '../../dtos/get/get.dto';
import { UpdateBodyDTO, UpdateParamsDTO } from '../../dtos/update/update.dto';
import { IUsersRepository } from '../../repositories/i.users.repository';
import { IUsersService } from '../i.users.service';

@Injectable()
export class UsersService extends IUsersService {
  private readonly SALT_ROUNDS_DEV = 4;
  private readonly SALT_ROUNDS_PROD = 14;
  private readonly configService: ConfigService;

  public constructor(
    @Inject(IUsersRepository) usersRepository: IUsersRepository,
    @Inject(ConfigService) configService: ConfigService,
    @Inject(IHelpersService) helperService: IHelpersService,
  ) {
    super(usersRepository, helperService);
    this.configService = configService;
  }

  public async create(body: CreateBodyDTO): Promise<SafeUser> {
    const hashedPassword = await this.hashPassword(body.password);

    body.password = hashedPassword;

    const user = await this.usersRepository.create(body);

    if (!user) {
      throw new EntityAlreadyExistsException('User');
    }

    return new SafeUser(user);
  }

  public async getSafeById(params: GetByIdParamsDTO): Promise<SafeUser> {
    const user = await this.usersRepository.getById(params);

    if (!user) {
      throw new EntityNotFoundException('User');
    }

    return new SafeUser(user);
  }

  public async getByEmail(params: GetByEmailParamsDTO): Promise<User> {
    const user = await this.usersRepository.getByEmail(params);

    if (!user) {
      throw new EntityNotFoundException('User');
    }

    return user;
  }

  public async updateById(
    params: UpdateParamsDTO,
    body: UpdateBodyDTO,
  ): Promise<void> {
    await this.usersRepository.updateById(params, body);
  }

  public async comparePasswords(
    plainPassword: User['hashedPassword'],
    hashedPassword: User['hashedPassword'],
  ): Promise<boolean> {
    const pepperedPassword = this.pepperPassword(plainPassword);
    return bcrypt.compare(pepperedPassword, hashedPassword);
  }

  public async updatePasswordById(
    userId: User['id'],
    newPassword: User['hashedPassword'],
  ): Promise<void> {
    const hashedPassword = await this.hashPassword(newPassword);
    await this.usersRepository.updatePasswordById(userId, hashedPassword);
  }

  private async hashPassword(password: string): Promise<string> {
    const pepperedPassword = this.pepperPassword(password);

    const saltRounds = this.helperService.isProduction()
      ? this.SALT_ROUNDS_PROD
      : this.SALT_ROUNDS_DEV;

    return bcrypt.hash(pepperedPassword, saltRounds);
  }

  private pepperPassword(password: string): string {
    const pepper = this.configService.getOrThrow<string>('PASSWORD_PEPPER');
    return pepper + password;
  }
}
