import { PasswordResetToken, RefreshToken } from '@base-saas/shared';
import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { IDatabaseClient } from '../../../database/clients/i.database.client';
import { IHelpersService } from '../../../helpers/services/i.helpers.service';
import { AuthRepository } from './auth.repository';

describe('AuthRepository', () => {
  let authRepository: AuthRepository;
  let databaseClient: IDatabaseClient;
  let helpersService: IHelpersService;

  const mockUserId = 'user-123';
  const mockTokenHash = 'hashed-token-abc';
  const mockTokenId = 'token-id-456';
  const mockUUID = 'generated-uuid-789';
  const mockTimestamp = '2026-05-01T12:00:00.000Z';
  const mockExpiresAt = '2026-05-08T12:00:00.000Z';

  const mockRefreshTokenRow = {
    id: mockTokenId,
    user_id: mockUserId,
    hashed_token: mockTokenHash,
    expires_at: mockExpiresAt,
    revoked_at: null,
    created_at: mockTimestamp,
  };

  const mockPasswordResetTokenRow = {
    id: mockTokenId,
    user_id: mockUserId,
    hashed_token: mockTokenHash,
    expires_at: mockExpiresAt,
    used_at: null,
    created_at: mockTimestamp,
  };

  const createQueryBuilder = (returnData: unknown = null) => {
    const builder = {
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      is: vi.fn().mockReturnThis(),
      gt: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: returnData, error: null }),
    };
    return builder;
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [AuthRepository],
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
            formatTimestamp: vi.fn().mockReturnValue(mockExpiresAt),
            parseDate: vi
              .fn()
              .mockImplementation((date: string) => new Date(date)),
          };
        }
      })
      .compile();

    authRepository = moduleRef.get(AuthRepository);
    databaseClient = moduleRef.get(IDatabaseClient);
    helpersService = moduleRef.get(IHelpersService);
  });

  describe('storeRefreshToken', () => {
    it('should insert a new refresh token with correct data', async () => {
      const queryBuilder = createQueryBuilder();
      vi.spyOn(databaseClient, 'from').mockReturnValue(queryBuilder as never);

      const expiry = 7 * 24 * 60 * 60 * 1000;
      await authRepository.storeRefreshToken(mockUserId, mockTokenHash, expiry);

      expect(databaseClient.from).toHaveBeenCalledWith('refresh_tokens');
      expect(queryBuilder.insert).toHaveBeenCalledWith({
        id: mockUUID,
        user_id: mockUserId,
        hashed_token: mockTokenHash,
        expires_at: mockExpiresAt,
        revoked_at: null,
        created_at: mockTimestamp,
      });
      expect(helpersService.generateUUID).toHaveBeenCalledTimes(1);
      expect(helpersService.formatTimestamp).toHaveBeenCalledTimes(1);
      expect(helpersService.getCurrentTimestamp).toHaveBeenCalledTimes(1);
    });
  });

  describe('storePasswordResetToken', () => {
    it('should insert a new password reset token with correct data', async () => {
      const queryBuilder = createQueryBuilder();
      vi.spyOn(databaseClient, 'from').mockReturnValue(queryBuilder as never);

      const expiry = 1 * 60 * 60 * 1000;
      await authRepository.storePasswordResetToken(
        mockUserId,
        mockTokenHash,
        expiry,
      );

      expect(databaseClient.from).toHaveBeenCalledWith('password_reset_tokens');
      expect(queryBuilder.insert).toHaveBeenCalledWith({
        id: mockUUID,
        user_id: mockUserId,
        hashed_token: mockTokenHash,
        expires_at: mockExpiresAt,
        used_at: null,
        created_at: mockTimestamp,
      });
      expect(helpersService.generateUUID).toHaveBeenCalledTimes(1);
      expect(helpersService.formatTimestamp).toHaveBeenCalledTimes(1);
      expect(helpersService.getCurrentTimestamp).toHaveBeenCalledTimes(1);
    });
  });

  describe('getRefreshTokenByHash', () => {
    it('should return RefreshToken when valid token exists', async () => {
      const queryBuilder = createQueryBuilder(mockRefreshTokenRow);
      vi.spyOn(databaseClient, 'from').mockReturnValue(queryBuilder as never);

      const result = await authRepository.getRefreshTokenByHash(mockTokenHash);

      expect(databaseClient.from).toHaveBeenCalledWith('refresh_tokens');
      expect(queryBuilder.select).toHaveBeenCalled();
      expect(queryBuilder.eq).toHaveBeenCalledWith(
        'hashed_token',
        mockTokenHash,
      );
      expect(queryBuilder.is).toHaveBeenCalledWith('revoked_at', null);
      expect(queryBuilder.gt).toHaveBeenCalledWith('expires_at', mockTimestamp);
      expect(queryBuilder.single).toHaveBeenCalled();

      expect(result).toBeInstanceOf(RefreshToken);
      expect(result?.id).toBe(mockTokenId);
      expect(result?.userId).toBe(mockUserId);
      expect(result?.hashedToken).toBe(mockTokenHash);
    });

    it('should return null when token does not exist', async () => {
      const queryBuilder = createQueryBuilder(null);
      vi.spyOn(databaseClient, 'from').mockReturnValue(queryBuilder as never);

      const result =
        await authRepository.getRefreshTokenByHash('non-existent-hash');

      expect(result).toBeNull();
    });
  });

  describe('getPasswordResetTokenByHash', () => {
    it('should return PasswordResetToken when valid token exists', async () => {
      const queryBuilder = createQueryBuilder(mockPasswordResetTokenRow);
      vi.spyOn(databaseClient, 'from').mockReturnValue(queryBuilder as never);

      const result =
        await authRepository.getPasswordResetTokenByHash(mockTokenHash);

      expect(databaseClient.from).toHaveBeenCalledWith('password_reset_tokens');
      expect(queryBuilder.select).toHaveBeenCalled();
      expect(queryBuilder.eq).toHaveBeenCalledWith(
        'hashed_token',
        mockTokenHash,
      );
      expect(queryBuilder.is).toHaveBeenCalledWith('used_at', null);
      expect(queryBuilder.gt).toHaveBeenCalledWith('expires_at', mockTimestamp);
      expect(queryBuilder.single).toHaveBeenCalled();

      expect(result).toBeInstanceOf(PasswordResetToken);
      expect(result?.id).toBe(mockTokenId);
      expect(result?.userId).toBe(mockUserId);
      expect(result?.hashedToken).toBe(mockTokenHash);
    });

    it('should return null when token does not exist', async () => {
      const queryBuilder = createQueryBuilder(null);
      vi.spyOn(databaseClient, 'from').mockReturnValue(queryBuilder as never);

      const result =
        await authRepository.getPasswordResetTokenByHash('non-existent-hash');

      expect(result).toBeNull();
    });
  });

  describe('revokeRefreshTokenById', () => {
    it('should update revoked_at for the given token id', async () => {
      const queryBuilder = createQueryBuilder();
      vi.spyOn(databaseClient, 'from').mockReturnValue(queryBuilder as never);

      await authRepository.revokeRefreshTokenById(mockTokenId);

      expect(databaseClient.from).toHaveBeenCalledWith('refresh_tokens');
      expect(queryBuilder.update).toHaveBeenCalledWith(
        expect.objectContaining({ revoked_at: expect.any(String) }),
      );
      expect(queryBuilder.eq).toHaveBeenCalledWith('id', mockTokenId);
    });
  });

  describe('revokeRefreshTokenByHash', () => {
    it('should update revoked_at for the given token hash', async () => {
      const queryBuilder = createQueryBuilder();
      vi.spyOn(databaseClient, 'from').mockReturnValue(queryBuilder as never);

      await authRepository.revokeRefreshTokenByHash(mockTokenHash);

      expect(databaseClient.from).toHaveBeenCalledWith('refresh_tokens');
      expect(queryBuilder.update).toHaveBeenCalledWith(
        expect.objectContaining({ revoked_at: expect.any(String) }),
      );
      expect(queryBuilder.eq).toHaveBeenCalledWith(
        'hashed_token',
        mockTokenHash,
      );
    });
  });

  describe('revokeRefreshTokensByUserId', () => {
    it('should update revoked_at for all user tokens', async () => {
      const queryBuilder = createQueryBuilder();
      vi.spyOn(databaseClient, 'from').mockReturnValue(queryBuilder as never);

      await authRepository.revokeRefreshTokensByUserId(mockUserId);

      expect(databaseClient.from).toHaveBeenCalledWith('refresh_tokens');
      expect(queryBuilder.update).toHaveBeenCalledWith(
        expect.objectContaining({ revoked_at: expect.any(String) }),
      );
      expect(queryBuilder.eq).toHaveBeenCalledWith('user_id', mockUserId);
      expect(queryBuilder.is).toHaveBeenCalledWith('revoked_at', null);
    });
  });

  describe('markPasswordResetTokenAsUsed', () => {
    it('should update used_at for all user password reset tokens', async () => {
      const queryBuilder = createQueryBuilder();
      vi.spyOn(databaseClient, 'from').mockReturnValue(queryBuilder as never);

      await authRepository.markPasswordResetTokenAsUsed(mockUserId);

      expect(databaseClient.from).toHaveBeenCalledWith('password_reset_tokens');
      expect(queryBuilder.update).toHaveBeenCalledWith(
        expect.objectContaining({ used_at: expect.any(String) }),
      );
      expect(queryBuilder.eq).toHaveBeenCalledWith('user_id', mockUserId);
      expect(queryBuilder.is).toHaveBeenCalledWith('used_at', null);
    });
  });
});
