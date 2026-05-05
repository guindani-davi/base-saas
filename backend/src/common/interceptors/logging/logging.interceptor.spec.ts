import { CallHandler, ExecutionContext, Logger } from '@nestjs/common';
import { lastValueFrom, of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LoggingInterceptor } from './logging.interceptor';

describe('LoggingInterceptor', () => {
  let interceptor: LoggingInterceptor;
  let mockRequest: { method: string; url: string };
  let mockResponse: { statusCode: number };
  let mockExecutionContext: ExecutionContext;
  let mockCallHandler: CallHandler;
  let logSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    interceptor = new LoggingInterceptor();

    mockRequest = {
      method: 'GET',
      url: '/api/users',
    };

    mockResponse = {
      statusCode: 200,
    };

    mockExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
        getResponse: () => mockResponse,
      }),
    } as unknown as ExecutionContext;

    mockCallHandler = {
      handle: vi.fn().mockReturnValue(of({ data: 'test' })),
    };

    logSpy = vi.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
  });

  it('should log incoming request', async () => {
    await lastValueFrom(
      interceptor.intercept(mockExecutionContext, mockCallHandler),
    );

    expect(logSpy).toHaveBeenCalledWith('Incoming request → GET /api/users');
  });

  it('should log response with status code and duration', async () => {
    await lastValueFrom(
      interceptor.intercept(mockExecutionContext, mockCallHandler),
    );

    expect(logSpy).toHaveBeenCalledWith(
      expect.stringMatching(/GET \/api\/users → 200 - \d+ms/),
    );
  });

  it('should call next.handle()', async () => {
    await lastValueFrom(
      interceptor.intercept(mockExecutionContext, mockCallHandler),
    );

    expect(mockCallHandler.handle).toHaveBeenCalledTimes(1);
  });

  it('should pass through the response data', async () => {
    const result = await lastValueFrom(
      interceptor.intercept(mockExecutionContext, mockCallHandler),
    );

    expect(result).toEqual({ data: 'test' });
  });

  it('should log different HTTP methods', async () => {
    mockRequest.method = 'POST';
    mockRequest.url = '/api/auth/login';

    await lastValueFrom(
      interceptor.intercept(mockExecutionContext, mockCallHandler),
    );

    expect(logSpy).toHaveBeenCalledWith(
      'Incoming request → POST /api/auth/login',
    );
  });

  it('should log different status codes', async () => {
    mockResponse.statusCode = 201;

    await lastValueFrom(
      interceptor.intercept(mockExecutionContext, mockCallHandler),
    );

    expect(logSpy).toHaveBeenCalledWith(
      expect.stringMatching(/GET \/api\/users → 201 - \d+ms/),
    );
  });
});
