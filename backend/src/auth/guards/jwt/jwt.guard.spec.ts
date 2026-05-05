import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { IS_PUBLIC_KEY } from '../../decorators/public/public.decorator';
import { JwtGuard } from './jwt.guard';

describe('JwtGuard', () => {
  let jwtGuard: JwtGuard;
  let jwtService: JwtService;
  let configService: ConfigService;
  let reflector: Reflector;

  const TEST_JWT_SECRET = 'test-jwt-secret';

  const mockJwtService = {
    verifyAsync: vi.fn(),
  };

  const mockConfigService = {
    getOrThrow: vi.fn().mockReturnValue(TEST_JWT_SECRET),
  };

  const mockReflector = {
    getAllAndOverride: vi.fn(),
  };

  const createMockExecutionContext = (
    authorization?: string,
  ): ExecutionContext => {
    const mockRequest = {
      headers: {
        authorization,
      },
      user: undefined,
    };

    return {
      getHandler: vi.fn(),
      getClass: vi.fn(),
      switchToHttp: vi.fn().mockReturnValue({
        getRequest: vi.fn().mockReturnValue(mockRequest),
      }),
    } as unknown as ExecutionContext;
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        JwtGuard,
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: Reflector, useValue: mockReflector },
      ],
    }).compile();

    jwtGuard = moduleRef.get(JwtGuard);
    jwtService = moduleRef.get(JwtService);
    configService = moduleRef.get(ConfigService);
    reflector = moduleRef.get(Reflector);
  });

  describe('Public Routes', () => {
    it('should allow access when route is decorated with @Public()', async () => {
      mockReflector.getAllAndOverride.mockReturnValue(true);
      const context = createMockExecutionContext();

      const result = await jwtGuard.canActivate(context);

      expect(result).toBe(true);
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
      expect(jwtService.verifyAsync).not.toHaveBeenCalled();
    });
  });

  describe('Missing Token', () => {
    beforeEach(() => {
      mockReflector.getAllAndOverride.mockReturnValue(false);
    });

    it('should throw UnauthorizedException when no Authorization header is present', async () => {
      const context = createMockExecutionContext(undefined);

      await expect(jwtGuard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(jwtGuard.canActivate(context)).rejects.toMatchObject({
        response: {
          message: 'Authentication is required to access this resource',
          messageKey: 'errors.authRequired',
        },
      });
    });

    it('should throw UnauthorizedException when Authorization header is empty', async () => {
      const context = createMockExecutionContext('');

      await expect(jwtGuard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('Invalid Authorization Format', () => {
    beforeEach(() => {
      mockReflector.getAllAndOverride.mockReturnValue(false);
    });

    it('should throw UnauthorizedException when token type is not Bearer', async () => {
      const context = createMockExecutionContext('Basic some-token');

      await expect(jwtGuard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when Authorization header has only the type', async () => {
      const context = createMockExecutionContext('Bearer');

      await expect(jwtGuard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when Authorization header has Bearer with empty token', async () => {
      const context = createMockExecutionContext('Bearer ');

      await expect(jwtGuard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('Token Verification Failures', () => {
    beforeEach(() => {
      mockReflector.getAllAndOverride.mockReturnValue(false);
    });

    it('should throw UnauthorizedException when token is expired', async () => {
      mockJwtService.verifyAsync.mockRejectedValue(new Error('jwt expired'));
      const context = createMockExecutionContext('Bearer expired-token');

      await expect(jwtGuard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(jwtGuard.canActivate(context)).rejects.toMatchObject({
        response: {
          message: 'Authentication token is invalid or expired',
          messageKey: 'errors.authInvalidToken',
        },
      });
    });

    it('should throw UnauthorizedException when token has invalid signature', async () => {
      mockJwtService.verifyAsync.mockRejectedValue(
        new Error('invalid signature'),
      );
      const context = createMockExecutionContext(
        'Bearer invalid-signature-token',
      );

      await expect(jwtGuard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when token has wrong issuer', async () => {
      mockJwtService.verifyAsync.mockRejectedValue(
        new Error('jwt issuer invalid'),
      );
      const context = createMockExecutionContext('Bearer wrong-issuer-token');

      await expect(jwtGuard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when token has wrong audience', async () => {
      mockJwtService.verifyAsync.mockRejectedValue(
        new Error('jwt audience invalid'),
      );
      const context = createMockExecutionContext('Bearer wrong-audience-token');

      await expect(jwtGuard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('Successful Authentication', () => {
    beforeEach(() => {
      mockReflector.getAllAndOverride.mockReturnValue(false);
    });

    it('should return true and attach payload to request when token is valid', async () => {
      const mockPayload = { sub: 'user-123' };
      mockJwtService.verifyAsync.mockResolvedValue(mockPayload);

      const mockRequest = {
        headers: { authorization: 'Bearer valid-token' },
        user: undefined,
      };
      const context = {
        getHandler: vi.fn(),
        getClass: vi.fn(),
        switchToHttp: vi.fn().mockReturnValue({
          getRequest: vi.fn().mockReturnValue(mockRequest),
        }),
      } as unknown as ExecutionContext;

      const result = await jwtGuard.canActivate(context);

      expect(result).toBe(true);
      expect(mockRequest.user).toEqual(mockPayload);
    });

    it('should verify token with correct secret from ConfigService', async () => {
      const mockPayload = { sub: 'user-123' };
      mockJwtService.verifyAsync.mockResolvedValue(mockPayload);
      const context = createMockExecutionContext('Bearer valid-token');

      await jwtGuard.canActivate(context);

      expect(configService.getOrThrow).toHaveBeenCalledWith('JWT_SECRET');
      expect(jwtService.verifyAsync).toHaveBeenCalledWith('valid-token', {
        secret: TEST_JWT_SECRET,
        issuer: 'base-saas',
        audience: 'base-saas-api',
      });
    });
  });

  describe('Edge Cases', () => {
    beforeEach(() => {
      mockReflector.getAllAndOverride.mockReturnValue(false);
    });

    it('should throw UnauthorizedException when ConfigService fails to provide JWT_SECRET', async () => {
      mockConfigService.getOrThrow.mockImplementation(() => {
        throw new Error('Config JWT_SECRET not found');
      });
      const context = createMockExecutionContext('Bearer some-token');

      await expect(jwtGuard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
