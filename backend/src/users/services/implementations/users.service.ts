import { SafeUser, User } from '@base-saas/shared';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { IHelpersService } from '../../../helpers/services/i.helpers.service';
import { CreateBodyDTO } from '../../dtos/create.dto';
import { GetByEmailParamsDTO, GetByIdParamsDTO } from '../../dtos/get.dto';
import { UpdateBodyDTO, UpdateParamsDTO } from '../../dtos/update.dto';
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

    return new SafeUser(user);
  }

  public async getSafeById(params: GetByIdParamsDTO): Promise<SafeUser> {
    const user = await this.usersRepository.getById(params);
    return new SafeUser(user);
  }

  public async getByEmail(params: GetByEmailParamsDTO): Promise<User> {
    return await this.usersRepository.getByEmail(params);
  }

  public async updateById(
    params: UpdateParamsDTO,
    body: UpdateBodyDTO,
  ): Promise<void> {
    await this.usersRepository.updateById(params, body);
  }

  public async comparePasswords(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    const pepperedPassword = this.pepperPassword(plainPassword);
    return bcrypt.compare(pepperedPassword, hashedPassword);
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
