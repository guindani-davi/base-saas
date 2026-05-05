import { TokensResponse } from '@base-saas/shared';
import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EntityNotFoundException } from '../../../common/exceptions/domain/implementations/entity-not-found/entity-not-found.exception';
import { LoginBodyDTO } from '../../dtos/login/login.dto';
import { RunPasswordResetBodyDTO } from '../../dtos/password-reset/run/run.dto';
import { StartPasswordResetBodyDTO } from '../../dtos/password-reset/start/start.dto';
import { RefreshBodyDTO } from '../../dtos/refresh/refresh.dto';
import { InvalidCredentialsException } from '../../exceptions/invalid-credentals/invalid-credentials.exception';
import { InvalidRefreshTokenException } from '../../exceptions/invalid-refresh-token/invalid-refresh-token.exception';
import { IAuthService } from '../../services/i.auth.service';
import { AuthController } from './auth.controller';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: IAuthService;

  const mockTokensResponse = new TokensResponse(
    'mock-access-token',
    'mock-refresh-token',
  );

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
    })
      .useMocker((token) => {
        if (token === IAuthService) {
          return {
            login: vi.fn(),
            refresh: vi.fn(),
            logout: vi.fn(),
            startPasswordReset: vi.fn(),
            runPasswordReset: vi.fn(),
          };
        }
      })
      .compile();

    authController = moduleRef.get(AuthController);
    authService = moduleRef.get(IAuthService);
  });

  describe('login', () => {
    const loginBodyDTO: LoginBodyDTO = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should return tokens on valid credentials', async () => {
      vi.spyOn(authService, 'login').mockResolvedValue(mockTokensResponse);

      const result = await authController.login(loginBodyDTO);

      expect(result).toBe(mockTokensResponse);
      expect(authService.login).toHaveBeenCalledWith(loginBodyDTO);
      expect(authService.login).toHaveBeenCalledTimes(1);
    });

    it('should propagate InvalidCredentialsException from service', async () => {
      vi.spyOn(authService, 'login').mockRejectedValue(
        new InvalidCredentialsException(),
      );

      await expect(authController.login(loginBodyDTO)).rejects.toThrow(
        InvalidCredentialsException,
      );
    });
  });

  describe('refresh', () => {
    const refreshBodyDTO: RefreshBodyDTO = {
      refreshToken: 'valid-refresh-token',
    };

    it('should return new tokens on valid refresh token', async () => {
      vi.spyOn(authService, 'refresh').mockResolvedValue(mockTokensResponse);

      const result = await authController.refresh(refreshBodyDTO);

      expect(result).toBe(mockTokensResponse);
      expect(authService.refresh).toHaveBeenCalledWith(refreshBodyDTO);
      expect(authService.refresh).toHaveBeenCalledTimes(1);
    });

    it('should propagate InvalidRefreshTokenException from service', async () => {
      vi.spyOn(authService, 'refresh').mockRejectedValue(
        new InvalidRefreshTokenException(),
      );

      await expect(authController.refresh(refreshBodyDTO)).rejects.toThrow(
        InvalidRefreshTokenException,
      );
    });
  });

  describe('logout', () => {
    const refreshBodyDTO: RefreshBodyDTO = {
      refreshToken: 'valid-refresh-token',
    };

    it('should call service logout and return void', async () => {
      vi.spyOn(authService, 'logout').mockResolvedValue(undefined);

      const result = await authController.logout(refreshBodyDTO);

      expect(result).toBeUndefined();
      expect(authService.logout).toHaveBeenCalledWith(refreshBodyDTO);
      expect(authService.logout).toHaveBeenCalledTimes(1);
    });

    it('should propagate exceptions from service', async () => {
      vi.spyOn(authService, 'logout').mockRejectedValue(
        new InvalidRefreshTokenException(),
      );

      await expect(authController.logout(refreshBodyDTO)).rejects.toThrow(
        InvalidRefreshTokenException,
      );
    });
  });

  describe('startPasswordReset', () => {
    const startPasswordResetDTO: StartPasswordResetBodyDTO = {
      email: 'test@example.com',
    };

    it('should call service startPasswordReset and return void', async () => {
      vi.spyOn(authService, 'startPasswordReset').mockResolvedValue(undefined);

      const result = await authController.startPasswordReset(
        startPasswordResetDTO,
      );

      expect(result).toBeUndefined();
      expect(authService.startPasswordReset).toHaveBeenCalledWith(
        startPasswordResetDTO,
      );
      expect(authService.startPasswordReset).toHaveBeenCalledTimes(1);
    });

    it('should propagate EntityNotFoundException from service', async () => {
      vi.spyOn(authService, 'startPasswordReset').mockRejectedValue(
        new EntityNotFoundException('User'),
      );

      await expect(
        authController.startPasswordReset(startPasswordResetDTO),
      ).rejects.toThrow(EntityNotFoundException);
    });
  });

  describe('runPasswordReset', () => {
    const runPasswordResetDTO: RunPasswordResetBodyDTO = {
      token: 'valid-reset-token',
      newPassword: 'new-password-123',
    };

    it('should call service runPasswordReset and return void', async () => {
      vi.spyOn(authService, 'runPasswordReset').mockResolvedValue(undefined);

      const result = await authController.runPasswordReset(runPasswordResetDTO);

      expect(result).toBeUndefined();
      expect(authService.runPasswordReset).toHaveBeenCalledWith(
        runPasswordResetDTO,
      );
      expect(authService.runPasswordReset).toHaveBeenCalledTimes(1);
    });

    it('should propagate InvalidRefreshTokenException from service', async () => {
      vi.spyOn(authService, 'runPasswordReset').mockRejectedValue(
        new InvalidRefreshTokenException(),
      );

      await expect(
        authController.runPasswordReset(runPasswordResetDTO),
      ).rejects.toThrow(InvalidRefreshTokenException);
    });
  });
});
