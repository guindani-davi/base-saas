import { SafeUser, User } from '@base-saas/shared';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EntityAlreadyExistsException } from '../../../common/exceptions/domain/implementations/entity-already-exists/entity-already-exists.exception';
import { EntityNotFoundException } from '../../../common/exceptions/domain/implementations/entity-not-found/entity-not-found.exception';
import { IHelpersService } from '../../../helpers/services/i.helpers.service';
import { CreateBodyDTO } from '../../dtos/create/create.dto';
import { GetByEmailParamsDTO, GetByIdParamsDTO } from '../../dtos/get/get.dto';
import { UpdateBodyDTO, UpdateParamsDTO } from '../../dtos/update/update.dto';
import { IUsersRepository } from '../../repositories/i.users.repository';
import { UsersService } from './users.service';

vi.mock('bcrypt', () => ({
  hash: vi.fn(),
  compare: vi.fn(),
}));

describe('UsersService', () => {
  let usersService: UsersService;
  let usersRepository: IUsersRepository;
  let helpersService: IHelpersService;
  let configService: ConfigService;

  const mockUserId = 'user-123';
  const mockEmail = 'test@example.com';
  const mockPassword = 'password123';
  const mockHashedPassword = 'hashed-password';
  const mockPepper = 'secret-pepper';

  const mockUser = new User(
    mockUserId,
    mockEmail,
    'John',
    'Doe',
    mockHashedPassword,
    new Date(),
    null,
  );

  beforeEach(async () => {
    vi.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [UsersService],
    })
      .useMocker((token) => {
        if (token === IUsersRepository) {
          return {
            create: vi.fn(),
            getById: vi.fn(),
            getByEmail: vi.fn(),
            updateById: vi.fn(),
            updatePasswordById: vi.fn(),
          };
        }
        if (token === IHelpersService) {
          return {
            isProduction: vi.fn().mockReturnValue(false),
          };
        }
        if (token === ConfigService) {
          return {
            getOrThrow: vi.fn().mockReturnValue(mockPepper),
          };
        }
      })
      .compile();

    usersService = moduleRef.get(UsersService);
    usersRepository = moduleRef.get(IUsersRepository);
    helpersService = moduleRef.get(IHelpersService);
    configService = moduleRef.get(ConfigService);
  });

  describe('create', () => {
    const getCreateDto = (): CreateBodyDTO => ({
      email: mockEmail,
      password: mockPassword,
      name: 'John',
      surname: 'Doe',
    });

    it('should create user and return SafeUser', async () => {
      vi.mocked(bcrypt.hash).mockResolvedValue(mockHashedPassword as never);
      vi.spyOn(usersRepository, 'create').mockResolvedValue(mockUser);

      const result = await usersService.create(getCreateDto());

      expect(result).toBeInstanceOf(SafeUser);
      expect(result.email).toBe(mockEmail);
      expect(bcrypt.hash).toHaveBeenCalledWith(mockPepper + mockPassword, 4);
      expect(usersRepository.create).toHaveBeenCalled();
    });

    it('should use production salt rounds when in production', async () => {
      vi.spyOn(helpersService, 'isProduction').mockReturnValue(true);
      vi.mocked(bcrypt.hash).mockResolvedValue(mockHashedPassword as never);
      vi.spyOn(usersRepository, 'create').mockResolvedValue(mockUser);

      await usersService.create(getCreateDto());

      expect(bcrypt.hash).toHaveBeenCalledWith(mockPepper + mockPassword, 14);
    });

    it('should throw EntityAlreadyExistsException when user exists', async () => {
      vi.mocked(bcrypt.hash).mockResolvedValue(mockHashedPassword as never);
      vi.spyOn(usersRepository, 'create').mockResolvedValue(null);

      await expect(usersService.create(getCreateDto())).rejects.toThrow(
        EntityAlreadyExistsException,
      );
    });
  });

  describe('getSafeById', () => {
    const params: GetByIdParamsDTO = { id: mockUserId };

    it('should return SafeUser when user found', async () => {
      vi.spyOn(usersRepository, 'getById').mockResolvedValue(mockUser);

      const result = await usersService.getSafeById(params);

      expect(result).toBeInstanceOf(SafeUser);
      expect(result.id).toBe(mockUserId);
      expect(usersRepository.getById).toHaveBeenCalledWith(params);
    });

    it('should throw EntityNotFoundException when user not found', async () => {
      vi.spyOn(usersRepository, 'getById').mockResolvedValue(null);

      await expect(usersService.getSafeById(params)).rejects.toThrow(
        EntityNotFoundException,
      );
    });
  });

  describe('getByEmail', () => {
    const params: GetByEmailParamsDTO = { email: mockEmail };

    it('should return User when found', async () => {
      vi.spyOn(usersRepository, 'getByEmail').mockResolvedValue(mockUser);

      const result = await usersService.getByEmail(params);

      expect(result).toBeInstanceOf(User);
      expect(result.email).toBe(mockEmail);
      expect(usersRepository.getByEmail).toHaveBeenCalledWith(params);
    });

    it('should throw EntityNotFoundException when user not found', async () => {
      vi.spyOn(usersRepository, 'getByEmail').mockResolvedValue(null);

      await expect(usersService.getByEmail(params)).rejects.toThrow(
        EntityNotFoundException,
      );
    });
  });

  describe('updateById', () => {
    const params: UpdateParamsDTO = { id: mockUserId };
    const body: UpdateBodyDTO = { name: 'Jane', surname: 'Smith' };

    it('should call repository updateById', async () => {
      vi.spyOn(usersRepository, 'updateById').mockResolvedValue(undefined);

      await usersService.updateById(params, body);

      expect(usersRepository.updateById).toHaveBeenCalledWith(params, body);
      expect(usersRepository.updateById).toHaveBeenCalledTimes(1);
    });
  });

  describe('comparePasswords', () => {
    it('should return true when passwords match', async () => {
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

      const result = await usersService.comparePasswords(
        mockPassword,
        mockHashedPassword,
      );

      expect(result).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        mockPepper + mockPassword,
        mockHashedPassword,
      );
    });

    it('should return false when passwords do not match', async () => {
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      const result = await usersService.comparePasswords(
        'wrong-password',
        mockHashedPassword,
      );

      expect(result).toBe(false);
    });

    it('should use pepper from config', async () => {
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

      await usersService.comparePasswords(mockPassword, mockHashedPassword);

      expect(configService.getOrThrow).toHaveBeenCalledWith('PASSWORD_PEPPER');
    });
  });

  describe('updatePasswordById', () => {
    const newPassword = 'new-password-123';

    it('should hash password and call repository', async () => {
      vi.mocked(bcrypt.hash).mockResolvedValue(mockHashedPassword as never);
      vi.spyOn(usersRepository, 'updatePasswordById').mockResolvedValue(
        undefined,
      );

      await usersService.updatePasswordById(mockUserId, newPassword);

      expect(bcrypt.hash).toHaveBeenCalledWith(mockPepper + newPassword, 4);
      expect(usersRepository.updatePasswordById).toHaveBeenCalledWith(
        mockUserId,
        mockHashedPassword,
      );
    });

    it('should use production salt rounds when in production', async () => {
      vi.spyOn(helpersService, 'isProduction').mockReturnValue(true);
      vi.mocked(bcrypt.hash).mockResolvedValue(mockHashedPassword as never);
      vi.spyOn(usersRepository, 'updatePasswordById').mockResolvedValue(
        undefined,
      );

      await usersService.updatePasswordById(mockUserId, newPassword);

      expect(bcrypt.hash).toHaveBeenCalledWith(mockPepper + newPassword, 14);
    });
  });
});
