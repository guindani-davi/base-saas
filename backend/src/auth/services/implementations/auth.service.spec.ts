import {
  PasswordResetToken,
  RefreshToken,
  SafeUser,
  TokensResponse,
  User,
} from '@base-saas/shared';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EntityNotFoundException } from '../../../common/exceptions/domain/implementations/entity-not-found/entity-not-found.exception';
import { IEmailService } from '../../../email/services/i.email.service';
import { IUsersService } from '../../../users/services/i.users.service';
import { LoginBodyDTO } from '../../dtos/login/login.dto';
import { RunPasswordResetBodyDTO } from '../../dtos/password-reset/run/run.dto';
import { StartPasswordResetBodyDTO } from '../../dtos/password-reset/start/start.dto';
import { RefreshBodyDTO } from '../../dtos/refresh/refresh.dto';
import { InvalidCredentialsException } from '../../exceptions/invalid-credentals/invalid-credentials.exception';
import { InvalidRefreshTokenException } from '../../exceptions/invalid-refresh-token/invalid-refresh-token.exception';
import { IAuthRepository } from '../../repositories/i.auth.repository';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let authService: AuthService;
  let authRepository: IAuthRepository;
  let usersService: IUsersService;
  let jwtService: JwtService;
  let emailService: IEmailService;

  const mockUserId = 'user-123';
  const mockEmail = 'test@example.com';
  const mockPassword = 'password123';
  const mockHashedPassword = 'hashed-password';
  const mockAccessToken = 'mock-access-token';
  const mockRawRefreshToken = 'mock-raw-refresh-token';
  const mockTokenHash = 'mock-token-hash';
  const mockRefreshTokenId = 'refresh-token-id';
  const mockPasswordResetTokenId = 'password-reset-token-id';

  const mockUser = new User(
    mockUserId,
    mockEmail,
    'John',
    'Doe',
    mockHashedPassword,
    new Date(),
    null,
  );

  const mockSafeUser = new SafeUser(mockUser);

  const mockStoredRefreshToken = new RefreshToken(
    mockRefreshTokenId,
    mockUserId,
    mockTokenHash,
    new Date(Date.now() + 7 * 24 * 3600_000),
    null,
    new Date(),
  );

  const mockStoredPasswordResetToken = new PasswordResetToken(
    mockPasswordResetTokenId,
    mockUserId,
    mockTokenHash,
    new Date(Date.now() + 1 * 3600_000),
    null,
    new Date(),
  );

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [AuthService],
    })
      .useMocker((token) => {
        if (token === IAuthRepository) {
          return {
            storeRefreshToken: vi.fn().mockResolvedValue(undefined),
            getRefreshTokenByHash: vi.fn(),
            revokeRefreshTokenById: vi.fn().mockResolvedValue(undefined),
            revokeRefreshTokenByHash: vi.fn().mockResolvedValue(undefined),
            revokeRefreshTokensByUserId: vi.fn().mockResolvedValue(undefined),
            storePasswordResetToken: vi.fn().mockResolvedValue(undefined),
            getPasswordResetTokenByHash: vi.fn(),
            markPasswordResetTokenAsUsed: vi.fn().mockResolvedValue(undefined),
          };
        }
        if (token === IUsersService) {
          return {
            getByEmail: vi.fn(),
            getSafeById: vi.fn(),
            comparePasswords: vi.fn(),
            updatePasswordById: vi.fn().mockResolvedValue(undefined),
          };
        }
        if (token === JwtService) {
          return {
            signAsync: vi.fn().mockResolvedValue(mockAccessToken),
          };
        }
        if (token === IEmailService) {
          return {
            sendPasswordResetEmail: vi.fn().mockResolvedValue(undefined),
          };
        }
      })
      .compile();

    authService = moduleRef.get(AuthService);
    authRepository = moduleRef.get(IAuthRepository);
    usersService = moduleRef.get(IUsersService);
    jwtService = moduleRef.get(JwtService);
    emailService = moduleRef.get(IEmailService);
  });

  describe('login', () => {
    const loginBodyDTO: LoginBodyDTO = {
      email: mockEmail,
      password: mockPassword,
    };

    it('should return tokens on valid credentials', async () => {
      vi.spyOn(usersService, 'getByEmail').mockResolvedValue(mockUser);
      vi.spyOn(usersService, 'comparePasswords').mockResolvedValue(true);

      const result = await authService.login(loginBodyDTO);

      expect(result).toBeInstanceOf(TokensResponse);
      expect(result.accessToken).toBe(mockAccessToken);
      expect(result.refreshToken).toBeDefined();
      expect(usersService.getByEmail).toHaveBeenCalledWith({
        email: mockEmail,
      });
      expect(usersService.comparePasswords).toHaveBeenCalledWith(
        mockPassword,
        mockHashedPassword,
      );
      expect(jwtService.signAsync).toHaveBeenCalledWith({ sub: mockUserId });
      expect(authRepository.storeRefreshToken).toHaveBeenCalled();
    });

    it('should throw InvalidCredentialsException when user not found', async () => {
      vi.spyOn(usersService, 'getByEmail').mockRejectedValue(
        new EntityNotFoundException('User'),
      );

      await expect(authService.login(loginBodyDTO)).rejects.toThrow(
        InvalidCredentialsException,
      );
    });

    it('should throw InvalidCredentialsException when password does not match', async () => {
      vi.spyOn(usersService, 'getByEmail').mockResolvedValue(mockUser);
      vi.spyOn(usersService, 'comparePasswords').mockResolvedValue(false);

      await expect(authService.login(loginBodyDTO)).rejects.toThrow(
        InvalidCredentialsException,
      );
    });

    it('should propagate unexpected errors', async () => {
      const unexpectedError = new Error('Database connection failed');
      vi.spyOn(usersService, 'getByEmail').mockRejectedValue(unexpectedError);

      await expect(authService.login(loginBodyDTO)).rejects.toThrow(
        unexpectedError,
      );
    });
  });

  describe('refresh', () => {
    const refreshBodyDTO: RefreshBodyDTO = {
      refreshToken: mockRawRefreshToken,
    };

    it('should return new tokens on valid refresh token', async () => {
      vi.spyOn(authRepository, 'getRefreshTokenByHash').mockResolvedValue(
        mockStoredRefreshToken,
      );
      vi.spyOn(usersService, 'getSafeById').mockResolvedValue(mockSafeUser);

      const result = await authService.refresh(refreshBodyDTO);

      expect(result).toBeInstanceOf(TokensResponse);
      expect(result.accessToken).toBe(mockAccessToken);
      expect(result.refreshToken).toBeDefined();
      expect(authRepository.getRefreshTokenByHash).toHaveBeenCalled();
      expect(authRepository.revokeRefreshTokenById).toHaveBeenCalledWith(
        mockRefreshTokenId,
      );
      expect(usersService.getSafeById).toHaveBeenCalledWith({ id: mockUserId });
      expect(jwtService.signAsync).toHaveBeenCalledWith({ sub: mockUserId });
    });

    it('should throw InvalidRefreshTokenException when token not found', async () => {
      vi.spyOn(authRepository, 'getRefreshTokenByHash').mockResolvedValue(null);

      await expect(authService.refresh(refreshBodyDTO)).rejects.toThrow(
        InvalidRefreshTokenException,
      );
    });

    it('should revoke old token before generating new one', async () => {
      vi.spyOn(authRepository, 'getRefreshTokenByHash').mockResolvedValue(
        mockStoredRefreshToken,
      );
      vi.spyOn(usersService, 'getSafeById').mockResolvedValue(mockSafeUser);

      await authService.refresh(refreshBodyDTO);

      expect(authRepository.revokeRefreshTokenById).toHaveBeenCalledWith(
        mockRefreshTokenId,
      );
      expect(authRepository.storeRefreshToken).toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    const refreshBodyDTO: RefreshBodyDTO = {
      refreshToken: mockRawRefreshToken,
    };

    it('should revoke refresh token by hash', async () => {
      await authService.logout(refreshBodyDTO);

      expect(authRepository.revokeRefreshTokenByHash).toHaveBeenCalled();
    });
  });

  describe('startPasswordReset', () => {
    const startPasswordResetDTO: StartPasswordResetBodyDTO = {
      email: mockEmail,
    };

    it('should send password reset email on valid user', async () => {
      vi.spyOn(usersService, 'getByEmail').mockResolvedValue(mockUser);

      await authService.startPasswordReset(startPasswordResetDTO);

      expect(usersService.getByEmail).toHaveBeenCalledWith({
        email: mockEmail,
      });
      expect(authRepository.markPasswordResetTokenAsUsed).toHaveBeenCalledWith(
        mockUserId,
      );
      expect(authRepository.storePasswordResetToken).toHaveBeenCalled();
      expect(emailService.sendPasswordResetEmail).toHaveBeenCalledWith(
        mockEmail,
        expect.any(String),
      );
    });

    it('should throw EntityNotFoundException when user not found', async () => {
      vi.spyOn(usersService, 'getByEmail').mockRejectedValue(
        new EntityNotFoundException('User'),
      );

      await expect(
        authService.startPasswordReset(startPasswordResetDTO),
      ).rejects.toThrow(EntityNotFoundException);
    });

    it('should invalidate previous tokens before creating new one', async () => {
      vi.spyOn(usersService, 'getByEmail').mockResolvedValue(mockUser);

      await authService.startPasswordReset(startPasswordResetDTO);

      expect(authRepository.markPasswordResetTokenAsUsed).toHaveBeenCalledWith(
        mockUserId,
      );
      expect(authRepository.storePasswordResetToken).toHaveBeenCalled();
    });
  });

  describe('runPasswordReset', () => {
    const runPasswordResetDTO: RunPasswordResetBodyDTO = {
      token: mockRawRefreshToken,
      newPassword: 'new-password-123',
    };

    it('should reset password on valid token', async () => {
      vi.spyOn(authRepository, 'getPasswordResetTokenByHash').mockResolvedValue(
        mockStoredPasswordResetToken,
      );

      await authService.runPasswordReset(runPasswordResetDTO);

      expect(authRepository.getPasswordResetTokenByHash).toHaveBeenCalled();
      expect(authRepository.markPasswordResetTokenAsUsed).toHaveBeenCalledWith(
        mockUserId,
      );
      expect(usersService.updatePasswordById).toHaveBeenCalledWith(
        mockUserId,
        runPasswordResetDTO.newPassword,
      );
      expect(authRepository.revokeRefreshTokensByUserId).toHaveBeenCalledWith(
        mockUserId,
      );
    });

    it('should throw InvalidRefreshTokenException when token not found', async () => {
      vi.spyOn(authRepository, 'getPasswordResetTokenByHash').mockResolvedValue(
        null,
      );

      await expect(
        authService.runPasswordReset(runPasswordResetDTO),
      ).rejects.toThrow(InvalidRefreshTokenException);
    });

    it('should revoke all user refresh tokens after password reset', async () => {
      vi.spyOn(authRepository, 'getPasswordResetTokenByHash').mockResolvedValue(
        mockStoredPasswordResetToken,
      );

      await authService.runPasswordReset(runPasswordResetDTO);

      expect(authRepository.revokeRefreshTokensByUserId).toHaveBeenCalledWith(
        mockUserId,
      );
    });
  });
});
