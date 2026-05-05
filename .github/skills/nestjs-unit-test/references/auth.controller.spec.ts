import { TokensResponse } from "@base-saas/shared";
import { Test } from "@nestjs/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthController } from "../../../../backend/src/auth/controllers/implementations/auth.controller";
import { LoginBodyDTO } from "../../../../backend/src/auth/dtos/login/login.dto";
import { RefreshBodyDTO } from "../../../../backend/src/auth/dtos/refresh/refresh.dto";
import { InvalidCredentialsException } from "../../../../backend/src/auth/exceptions/invalid-credentals/invalid-credentials.exception";
import { InvalidRefreshTokenException } from "../../../../backend/src/auth/exceptions/invalid-refresh-token/invalid-refresh-token.exception";
import { IAuthService } from "../../../../backend/src/auth/services/i.auth.service";

describe("AuthController", () => {
  let authController: AuthController;
  let authService: IAuthService;

  const mockTokensResponse = new TokensResponse(
    "mock-access-token",
    "mock-refresh-token",
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
          };
        }
      })
      .compile();

    authController = moduleRef.get(AuthController);
    authService = moduleRef.get(IAuthService);
  });

  describe("login", () => {
    const loginBodyDTO: LoginBodyDTO = {
      email: "test@example.com",
      password: "password123",
    };

    it("should return tokens on valid credentials", async () => {
      vi.spyOn(authService, "login").mockResolvedValue(mockTokensResponse);

      const result = await authController.login(loginBodyDTO);

      expect(result).toBe(mockTokensResponse);
      expect(authService.login).toHaveBeenCalledWith(loginBodyDTO);
      expect(authService.login).toHaveBeenCalledTimes(1);
    });

    it("should propagate InvalidCredentialsException from service", async () => {
      vi.spyOn(authService, "login").mockRejectedValue(
        new InvalidCredentialsException(),
      );

      await expect(authController.login(loginBodyDTO)).rejects.toThrow(
        InvalidCredentialsException,
      );
    });
  });

  describe("refresh", () => {
    const refreshBodyDTO: RefreshBodyDTO = {
      refreshToken: "valid-refresh-token",
    };

    it("should return new tokens on valid refresh token", async () => {
      vi.spyOn(authService, "refresh").mockResolvedValue(mockTokensResponse);

      const result = await authController.refresh(refreshBodyDTO);

      expect(result).toBe(mockTokensResponse);
      expect(authService.refresh).toHaveBeenCalledWith(refreshBodyDTO);
      expect(authService.refresh).toHaveBeenCalledTimes(1);
    });

    it("should propagate InvalidRefreshTokenException from service", async () => {
      vi.spyOn(authService, "refresh").mockRejectedValue(
        new InvalidRefreshTokenException(),
      );

      await expect(authController.refresh(refreshBodyDTO)).rejects.toThrow(
        InvalidRefreshTokenException,
      );
    });
  });

  describe("logout", () => {
    const refreshBodyDTO: RefreshBodyDTO = {
      refreshToken: "valid-refresh-token",
    };

    it("should call service logout and return void", async () => {
      vi.spyOn(authService, "logout").mockResolvedValue(undefined);

      const result = await authController.logout(refreshBodyDTO);

      expect(result).toBeUndefined();
      expect(authService.logout).toHaveBeenCalledWith(refreshBodyDTO);
      expect(authService.logout).toHaveBeenCalledTimes(1);
    });

    it("should propagate exceptions from service", async () => {
      vi.spyOn(authService, "logout").mockRejectedValue(
        new InvalidRefreshTokenException(),
      );

      await expect(authController.logout(refreshBodyDTO)).rejects.toThrow(
        InvalidRefreshTokenException,
      );
    });
  });
});
