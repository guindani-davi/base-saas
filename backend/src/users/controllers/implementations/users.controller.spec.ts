import { JwtPayload, SafeUser, User } from '@base-saas/shared';
import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CreateBodyDTO } from '../../dtos/create/create.dto';
import { UpdateBodyDTO } from '../../dtos/update/update.dto';
import { IUsersService } from '../../services/i.users.service';
import { UsersController } from './users.controller';

describe('UsersController', () => {
  let usersController: UsersController;
  let usersService: IUsersService;

  const mockUserId = 'user-123';
  const mockUser = new User(
    mockUserId,
    'test@example.com',
    'John',
    'Doe',
    'hashed-password',
    new Date(),
    null,
  );
  const mockSafeUser = new SafeUser(mockUser);

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [UsersController],
    })
      .useMocker((token) => {
        if (token === IUsersService) {
          return {
            create: vi.fn(),
            getSafeById: vi.fn(),
            updateById: vi.fn(),
          };
        }
      })
      .compile();

    usersController = moduleRef.get(UsersController);
    usersService = moduleRef.get(IUsersService);
  });

  describe('createUser', () => {
    const createDTO: CreateBodyDTO = {
      email: 'test@example.com',
      password: 'password123',
      name: 'John',
      surname: 'Doe',
    };

    it('should create a user and return SafeUser', async () => {
      vi.spyOn(usersService, 'create').mockResolvedValue(mockSafeUser);

      const result = await usersController.createUser(createDTO);

      expect(result).toBe(mockSafeUser);
      expect(usersService.create).toHaveBeenCalledWith(createDTO);
      expect(usersService.create).toHaveBeenCalledTimes(1);
    });

    it('should propagate exceptions from service', async () => {
      const error = new Error('User creation failed');
      vi.spyOn(usersService, 'create').mockRejectedValue(error);

      await expect(usersController.createUser(createDTO)).rejects.toThrow(
        error,
      );
    });
  });

  describe('getMe', () => {
    const jwtPayload: JwtPayload = { sub: mockUserId };

    it('should return SafeUser for authenticated user', async () => {
      vi.spyOn(usersService, 'getSafeById').mockResolvedValue(mockSafeUser);

      const result = await usersController.getMe(jwtPayload);

      expect(result).toBe(mockSafeUser);
      expect(usersService.getSafeById).toHaveBeenCalledWith({ id: mockUserId });
      expect(usersService.getSafeById).toHaveBeenCalledTimes(1);
    });

    it('should propagate exceptions from service', async () => {
      const error = new Error('User not found');
      vi.spyOn(usersService, 'getSafeById').mockRejectedValue(error);

      await expect(usersController.getMe(jwtPayload)).rejects.toThrow(error);
    });
  });

  describe('updateMe', () => {
    const jwtPayload: JwtPayload = { sub: mockUserId };
    const updateDTO: UpdateBodyDTO = {
      name: 'Jane',
      surname: 'Smith',
    };

    it('should update user and return void', async () => {
      vi.spyOn(usersService, 'updateById').mockResolvedValue(undefined);

      const result = await usersController.updateMe(jwtPayload, updateDTO);

      expect(result).toBeUndefined();
      expect(usersService.updateById).toHaveBeenCalledWith(
        { id: mockUserId },
        updateDTO,
      );
      expect(usersService.updateById).toHaveBeenCalledTimes(1);
    });

    it('should propagate exceptions from service', async () => {
      const error = new Error('Update failed');
      vi.spyOn(usersService, 'updateById').mockRejectedValue(error);

      await expect(
        usersController.updateMe(jwtPayload, updateDTO),
      ).rejects.toThrow(error);
    });
  });
});
