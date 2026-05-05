import { User } from '@base-saas/shared';
import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { IDatabaseClient } from '../../../database/clients/i.database.client';
import { PostgresErrorCode } from '../../../database/enums/postgres-error-code.enum';
import { DatabaseException } from '../../../database/exceptions/database.exception';
import { IHelpersService } from '../../../helpers/services/i.helpers.service';
import { CreateBodyDTO } from '../../dtos/create/create.dto';
import { GetByEmailParamsDTO, GetByIdParamsDTO } from '../../dtos/get/get.dto';
import { UpdateBodyDTO, UpdateParamsDTO } from '../../dtos/update/update.dto';
import { UsersRepository } from './users.repository';

const createQueryBuilder = (
  returnData: unknown = null,
  error: { code: string } | null = null,
) => {
  const builder = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: returnData, error }),
  };
  return builder;
};

describe('UsersRepository', () => {
  let usersRepository: UsersRepository;
  let databaseClient: IDatabaseClient;
  let helpersService: IHelpersService;

  const mockUserId = 'user-123';
  const mockEmail = 'test@example.com';
  const mockUUID = 'generated-uuid-789';
  const mockTimestamp = '2026-05-01T12:00:00.000Z';

  const mockUserRow = {
    id: mockUserId,
    email: mockEmail,
    name: 'John',
    surname: 'Doe',
    hashed_password: 'hashed-password',
    is_active: true,
    created_at: mockTimestamp,
    updated_at: null,
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [UsersRepository],
    })
      .useMocker((token) => {
        if (token === IDatabaseClient) {
          return {
            from: vi.fn(),
          };
        }
        if (token === IHelpersService) {
          return {
            generateUUID: vi.fn().mockReturnValue(mockUUID),
            getCurrentTimestamp: vi.fn().mockReturnValue(mockTimestamp),
            parseDate: vi
              .fn()
              .mockImplementation((date: string) => new Date(date)),
          };
        }
      })
      .compile();

    usersRepository = moduleRef.get(UsersRepository);
    databaseClient = moduleRef.get(IDatabaseClient);
    helpersService = moduleRef.get(IHelpersService);
  });

  describe('create', () => {
    const createDTO: CreateBodyDTO = {
      email: mockEmail,
      password: 'password123',
      name: 'John',
      surname: 'Doe',
    };

    it('should create user and return User entity', async () => {
      const queryBuilder = createQueryBuilder(mockUserRow);
      vi.spyOn(databaseClient, 'from').mockReturnValue(queryBuilder as never);

      const result = await usersRepository.create(createDTO);

      expect(result).toBeInstanceOf(User);
      expect(result?.email).toBe(mockEmail);
      expect(databaseClient.from).toHaveBeenCalledWith('users');
      expect(queryBuilder.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          id: mockUUID,
          email: mockEmail,
          name: 'John',
          surname: 'Doe',
        }),
      );
      expect(helpersService.generateUUID).toHaveBeenCalled();
    });

    it('should return null on unique violation', async () => {
      const queryBuilder = createQueryBuilder(null, {
        code: PostgresErrorCode.UNIQUE_VIOLATION,
      });
      vi.spyOn(databaseClient, 'from').mockReturnValue(queryBuilder as never);

      const result = await usersRepository.create(createDTO);

      expect(result).toBeNull();
    });

    it('should throw DatabaseException on other errors', async () => {
      const queryBuilder = createQueryBuilder(null, {
        code: 'UNKNOWN_ERROR',
      });
      vi.spyOn(databaseClient, 'from').mockReturnValue(queryBuilder as never);

      await expect(usersRepository.create(createDTO)).rejects.toThrow(
        DatabaseException,
      );
    });
  });

  describe('getById', () => {
    const params: GetByIdParamsDTO = { id: mockUserId };

    it('should return User when found', async () => {
      const queryBuilder = createQueryBuilder(mockUserRow);
      vi.spyOn(databaseClient, 'from').mockReturnValue(queryBuilder as never);

      const result = await usersRepository.getById(params);

      expect(result).toBeInstanceOf(User);
      expect(result?.id).toBe(mockUserId);
      expect(queryBuilder.eq).toHaveBeenCalledWith('id', mockUserId);
    });

    it('should return null when not found', async () => {
      const queryBuilder = createQueryBuilder(null);
      vi.spyOn(databaseClient, 'from').mockReturnValue(queryBuilder as never);

      const result = await usersRepository.getById(params);

      expect(result).toBeNull();
    });
  });

  describe('getByEmail', () => {
    const params: GetByEmailParamsDTO = { email: mockEmail };

    it('should return User when found', async () => {
      const queryBuilder = createQueryBuilder(mockUserRow);
      vi.spyOn(databaseClient, 'from').mockReturnValue(queryBuilder as never);

      const result = await usersRepository.getByEmail(params);

      expect(result).toBeInstanceOf(User);
      expect(result?.email).toBe(mockEmail);
      expect(queryBuilder.eq).toHaveBeenCalledWith('email', mockEmail);
    });

    it('should return null when not found', async () => {
      const queryBuilder = createQueryBuilder(null);
      vi.spyOn(databaseClient, 'from').mockReturnValue(queryBuilder as never);

      const result = await usersRepository.getByEmail(params);

      expect(result).toBeNull();
    });
  });

  describe('updateById', () => {
    const params: UpdateParamsDTO = { id: mockUserId };
    const body: UpdateBodyDTO = { name: 'Jane', surname: 'Smith' };

    it('should update user successfully', async () => {
      const queryBuilder = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: null, error: null }),
      };
      vi.spyOn(databaseClient, 'from').mockReturnValue(queryBuilder as never);

      await usersRepository.updateById(params, body);

      expect(databaseClient.from).toHaveBeenCalledWith('users');
      expect(queryBuilder.update).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Jane',
          surname: 'Smith',
          updated_at: mockTimestamp,
        }),
      );
      expect(queryBuilder.eq).toHaveBeenCalledWith('id', mockUserId);
    });

    it('should throw DatabaseException on error', async () => {
      const queryBuilder = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: null, error: { code: 'ERROR' } }),
      };
      vi.spyOn(databaseClient, 'from').mockReturnValue(queryBuilder as never);

      await expect(usersRepository.updateById(params, body)).rejects.toThrow(
        DatabaseException,
      );
    });
  });

  describe('updatePasswordById', () => {
    const newHashedPassword = 'new-hashed-password';

    it('should update password successfully', async () => {
      const queryBuilder = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: null, error: null }),
      };
      vi.spyOn(databaseClient, 'from').mockReturnValue(queryBuilder as never);

      await usersRepository.updatePasswordById(mockUserId, newHashedPassword);

      expect(databaseClient.from).toHaveBeenCalledWith('users');
      expect(queryBuilder.update).toHaveBeenCalledWith(
        expect.objectContaining({
          hashed_password: newHashedPassword,
          updated_at: mockTimestamp,
        }),
      );
      expect(queryBuilder.eq).toHaveBeenCalledWith('id', mockUserId);
    });

    it('should throw DatabaseException on error', async () => {
      const queryBuilder = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: null, error: { code: 'ERROR' } }),
      };
      vi.spyOn(databaseClient, 'from').mockReturnValue(queryBuilder as never);

      await expect(
        usersRepository.updatePasswordById(mockUserId, newHashedPassword),
      ).rejects.toThrow(DatabaseException);
    });
  });
});
