import { DomainExceptionCode } from '@base-saas/shared';
import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { DomainException } from '../exceptions/domain/domain.exception';
import { ApiErrorResponse } from '../models/api-error.model';

const ERROR_MESSAGES: Record<string, string> = {
  'errors.databaseError': 'An unexpected database error occurred',
  'errors.entityNotFound': '{entity} was not found',
  'errors.entityAlreadyExists': '{entity} already exists',
  'errors.invalidCredentials': 'Invalid email or password',
  'errors.invalidRefreshToken': 'Invalid or expired refresh token',
  'errors.authInvalidToken': 'Authentication token is invalid or expired',
};

const ENTITY_NAMES: Record<string, string> = {
  user: 'User',
};

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger: Logger;

  public constructor() {
    this.logger = new Logger(AllExceptionsFilter.name);
  }

  private static readonly DOMAIN_CODE_TO_STATUS = new Map<
    DomainExceptionCode,
    HttpStatus
  >([
    [DomainExceptionCode.ENTITY_NOT_FOUND, HttpStatus.NOT_FOUND],
    [DomainExceptionCode.ENTITY_ALREADY_EXISTS, HttpStatus.CONFLICT],
    [DomainExceptionCode.DATABASE_ERROR, HttpStatus.INTERNAL_SERVER_ERROR],
    [DomainExceptionCode.INVALID_CREDENTIALS, HttpStatus.UNAUTHORIZED],
    [DomainExceptionCode.INVALID_REFRESH_TOKEN, HttpStatus.UNAUTHORIZED],
  ]);

  public catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const request = host.switchToHttp().getRequest<Request>();

    const { statusCode, errorResponse } = this.buildErrorResponse(exception);

    this.logException(statusCode, request, exception);

    response.status(statusCode).json(errorResponse);
  }

  private logException(
    statusCode: number,
    request: Request,
    exception: unknown,
  ): void {
    const message =
      exception instanceof Error ? exception.message : 'Unknown error';
    const logMessage = `${statusCode} - ${message} | ${request.method} ${request.url}`;

    if (statusCode >= 500) {
      this.logger.error(logMessage);

      if (exception instanceof Error) {
        this.logger.error(exception.stack);
      }
    } else {
      this.logger.warn(logMessage);
    }
  }

  private buildErrorResponse(exception: unknown): {
    statusCode: number;
    errorResponse: ApiErrorResponse;
  } {
    if (exception instanceof DomainException) {
      return this.handleDomainException(exception);
    }

    if (exception instanceof HttpException) {
      return this.handleHttpException(exception);
    }

    return this.handleUnknownException();
  }

  private handleDomainException(exception: DomainException): {
    statusCode: number;
    errorResponse: ApiErrorResponse;
  } {
    const statusCode =
      AllExceptionsFilter.DOMAIN_CODE_TO_STATUS.get(exception.code) ??
      HttpStatus.INTERNAL_SERVER_ERROR;

    const translatedMessage = this.translate(
      exception.messageKey,
      exception.messageArgs,
    );

    return {
      statusCode,
      errorResponse: ApiErrorResponse.create(
        exception.code,
        translatedMessage,
        exception.details,
      ),
    };
  }

  private handleHttpException(exception: HttpException): {
    statusCode: number;
    errorResponse: ApiErrorResponse;
  } {
    const statusCode = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    if (this.isValidationError(exceptionResponse)) {
      const details = (exceptionResponse as { message: string[] }).message;

      return {
        statusCode,
        errorResponse: ApiErrorResponse.create(
          'VALIDATION_ERROR',
          ERROR_MESSAGES['errors.validationError'] ??
            'One or more validation errors occurred',
          details,
        ),
      };
    }

    if (
      typeof exceptionResponse === 'object' &&
      'messageKey' in exceptionResponse
    ) {
      const { messageKey } = exceptionResponse as { messageKey: string };
      const translatedMessage = this.translate(messageKey);
      const errorCode = this.statusToErrorCode(statusCode);

      return {
        statusCode,
        errorResponse: ApiErrorResponse.create(errorCode, translatedMessage),
      };
    }

    const message =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : ((exceptionResponse as { message?: string }).message ??
          'An unexpected error occurred');

    const errorCode = this.statusToErrorCode(statusCode);

    return {
      statusCode,
      errorResponse: ApiErrorResponse.create(errorCode, message),
    };
  }

  private handleUnknownException(): {
    statusCode: number;
    errorResponse: ApiErrorResponse;
  } {
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      errorResponse: ApiErrorResponse.create(
        'INTERNAL_SERVER_ERROR',
        ERROR_MESSAGES['errors.internalServerError'] ??
          'An unexpected error occurred',
      ),
    };
  }

  private translate(key: string, args?: Record<string, string>): string {
    let message = ERROR_MESSAGES[key] ?? key;

    if (args) {
      if (args.entity) {
        const entityKey = this.entityNameToKey(args.entity);
        args = { ...args, entity: ENTITY_NAMES[entityKey] ?? args.entity };
      }

      for (const [argKey, argValue] of Object.entries(args)) {
        message = message.replace(new RegExp(`\\{${argKey}\\}`, 'g'), argValue);
      }
    }

    return message;
  }

  private entityNameToKey(name: string): string {
    return name
      .replace(/-/g, ' ')
      .split(' ')
      .filter((word) => word.toLowerCase() !== 'link')
      .map((word, i) =>
        i === 0
          ? word.toLowerCase()
          : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
      )
      .join('');
  }

  private isValidationError(response: string | object): boolean {
    return (
      typeof response === 'object' &&
      'message' in response &&
      Array.isArray((response as { message: unknown }).message)
    );
  }

  private statusToErrorCode(status: number): string {
    const statusTextMap = new Map<number, string>([
      [HttpStatus.BAD_REQUEST, 'BAD_REQUEST'],
      [HttpStatus.UNAUTHORIZED, 'UNAUTHORIZED'],
      [HttpStatus.FORBIDDEN, 'FORBIDDEN'],
      [HttpStatus.NOT_FOUND, 'NOT_FOUND'],
      [HttpStatus.CONFLICT, 'CONFLICT'],
      [HttpStatus.UNPROCESSABLE_ENTITY, 'UNPROCESSABLE_ENTITY'],
      [HttpStatus.TOO_MANY_REQUESTS, 'TOO_MANY_REQUESTS'],
      [HttpStatus.INTERNAL_SERVER_ERROR, 'INTERNAL_SERVER_ERROR'],
    ]);

    return statusTextMap.get(status) ?? 'UNKNOWN_ERROR';
  }
}
