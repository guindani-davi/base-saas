import { DomainExceptionCode } from '@base-saas/shared';
import {
  ArgumentsHost,
  BadRequestException,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { InvalidCredentialsException } from '../../auth/exceptions/invalid-credentals/invalid-credentials.exception';
import { InvalidRefreshTokenException } from '../../auth/exceptions/invalid-refresh-token/invalid-refresh-token.exception';
import { EntityAlreadyExistsException } from '../exceptions/domain/implementations/entity-already-exists/entity-already-exists.exception';
import { EntityNotFoundException } from '../exceptions/domain/implementations/entity-not-found/entity-not-found.exception';
import { AllExceptionsFilter } from './all-exceptions.filter';

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;
  let mockResponse: {
    status: ReturnType<typeof vi.fn>;
    json: ReturnType<typeof vi.fn>;
  };
  let mockRequest: { method: string; url: string };
  let mockHost: ArgumentsHost;

  beforeEach(() => {
    filter = new AllExceptionsFilter();

    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };

    mockRequest = {
      method: 'GET',
      url: '/test',
    };

    mockHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    } as unknown as ArgumentsHost;

    vi.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
    vi.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});
  });

  describe('DomainException handling', () => {
    it('should return 404 for EntityNotFoundException', () => {
      const exception = new EntityNotFoundException('User');

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: DomainExceptionCode.ENTITY_NOT_FOUND,
          message: 'User was not found',
        }),
      );
    });

    it('should return 409 for EntityAlreadyExistsException', () => {
      const exception = new EntityAlreadyExistsException('User');

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: DomainExceptionCode.ENTITY_ALREADY_EXISTS,
          message: 'User already exists',
        }),
      );
    });

    it('should return 401 for InvalidCredentialsException', () => {
      const exception = new InvalidCredentialsException();

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: DomainExceptionCode.INVALID_CREDENTIALS,
          message: 'Invalid email or password',
        }),
      );
    });

    it('should return 401 for InvalidRefreshTokenException', () => {
      const exception = new InvalidRefreshTokenException();

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: DomainExceptionCode.INVALID_REFRESH_TOKEN,
          message: 'Invalid or expired refresh token',
        }),
      );
    });
  });

  describe('HttpException handling', () => {
    it('should handle validation errors with details array', () => {
      const exception = new BadRequestException({
        message: ['email must be an email', 'password is required'],
        error: 'Bad Request',
      });

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'VALIDATION_ERROR',
          details: ['email must be an email', 'password is required'],
        }),
      );
    });

    it('should handle HttpException with messageKey', () => {
      const exception = new HttpException(
        { messageKey: 'errors.invalidCredentials' },
        HttpStatus.UNAUTHORIZED,
      );

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'UNAUTHORIZED',
          message: 'Invalid email or password',
        }),
      );
    });

    it('should handle HttpException with plain string message', () => {
      const exception = new HttpException(
        'Custom error message',
        HttpStatus.FORBIDDEN,
      );

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'FORBIDDEN',
          message: 'Custom error message',
        }),
      );
    });

    it('should handle HttpException with object message', () => {
      const exception = new HttpException(
        { message: 'Object error message' },
        HttpStatus.BAD_REQUEST,
      );

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'BAD_REQUEST',
          message: 'Object error message',
        }),
      );
    });
  });

  describe('Unknown exception handling', () => {
    it('should return 500 for unknown errors', () => {
      const exception = new Error('Something went wrong');

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred',
        }),
      );
    });

    it('should return 500 for non-Error exceptions', () => {
      const exception = 'string error';

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    });
  });

  describe('logging behavior', () => {
    it('should log warn for 4xx errors', () => {
      const warnSpy = vi.spyOn(Logger.prototype, 'warn');
      const exception = new EntityNotFoundException('User');

      filter.catch(exception, mockHost);

      expect(warnSpy).toHaveBeenCalled();
    });

    it('should log error for 5xx errors', () => {
      const errorSpy = vi.spyOn(Logger.prototype, 'error');
      const exception = new Error('Internal error');

      filter.catch(exception, mockHost);

      expect(errorSpy).toHaveBeenCalled();
    });
  });

  describe('response structure', () => {
    it('should include timestamp in response', () => {
      const exception = new EntityNotFoundException('User');

      filter.catch(exception, mockHost);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          timestamp: expect.any(String),
        }),
      );
    });

    it('should include details when provided', () => {
      const exception = new BadRequestException({
        message: ['validation error 1', 'validation error 2'],
      });

      filter.catch(exception, mockHost);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          details: ['validation error 1', 'validation error 2'],
        }),
      );
    });
  });
});
