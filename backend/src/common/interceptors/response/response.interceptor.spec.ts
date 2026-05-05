import { CallHandler, ExecutionContext, StreamableFile } from '@nestjs/common';
import { lastValueFrom, of } from 'rxjs';
import { Readable } from 'stream';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiResponse } from '../../models/api-response.model';
import { ResponseInterceptor } from './response.interceptor';

describe('ResponseInterceptor', () => {
  let interceptor: ResponseInterceptor<unknown>;
  let mockExecutionContext: ExecutionContext;
  let mockCallHandler: CallHandler;

  beforeEach(() => {
    interceptor = new ResponseInterceptor();

    mockExecutionContext = {} as ExecutionContext;

    mockCallHandler = {
      handle: vi.fn(),
    };
  });

  it('should wrap object data in ApiResponse', async () => {
    const data = { id: '123', name: 'Test' };
    mockCallHandler.handle = vi.fn().mockReturnValue(of(data));

    const result = await lastValueFrom(
      interceptor.intercept(mockExecutionContext, mockCallHandler),
    );

    expect(result).toBeInstanceOf(ApiResponse);
    expect((result as ApiResponse<typeof data>).data).toEqual(data);
    expect((result as ApiResponse<typeof data>).timestamp).toBeDefined();
  });

  it('should wrap array data in ApiResponse', async () => {
    const data = [{ id: '1' }, { id: '2' }];
    mockCallHandler.handle = vi.fn().mockReturnValue(of(data));

    const result = await lastValueFrom(
      interceptor.intercept(mockExecutionContext, mockCallHandler),
    );

    expect(result).toBeInstanceOf(ApiResponse);
    expect((result as ApiResponse<typeof data>).data).toEqual(data);
  });

  it('should wrap null data in ApiResponse', async () => {
    mockCallHandler.handle = vi.fn().mockReturnValue(of(null));

    const result = await lastValueFrom(
      interceptor.intercept(mockExecutionContext, mockCallHandler),
    );

    expect(result).toBeInstanceOf(ApiResponse);
    expect((result as ApiResponse<null>).data).toBeNull();
  });

  it('should wrap undefined data in ApiResponse', async () => {
    mockCallHandler.handle = vi.fn().mockReturnValue(of(undefined));

    const result = await lastValueFrom(
      interceptor.intercept(mockExecutionContext, mockCallHandler),
    );

    expect(result).toBeInstanceOf(ApiResponse);
    expect((result as ApiResponse<undefined>).data).toBeUndefined();
  });

  it('should pass through StreamableFile without wrapping', async () => {
    const stream = new Readable({
      read() {
        this.push('test content');
        this.push(null);
      },
    });
    const streamableFile = new StreamableFile(stream);
    mockCallHandler.handle = vi.fn().mockReturnValue(of(streamableFile));

    const result = await lastValueFrom(
      interceptor.intercept(mockExecutionContext, mockCallHandler),
    );

    expect(result).toBeInstanceOf(StreamableFile);
    expect(result).toBe(streamableFile);
  });

  it('should call next.handle()', async () => {
    mockCallHandler.handle = vi.fn().mockReturnValue(of({ data: 'test' }));

    await lastValueFrom(
      interceptor.intercept(mockExecutionContext, mockCallHandler),
    );

    expect(mockCallHandler.handle).toHaveBeenCalledTimes(1);
  });

  it('should include timestamp in ApiResponse', async () => {
    const data = { message: 'Hello' };
    mockCallHandler.handle = vi.fn().mockReturnValue(of(data));

    const result = await lastValueFrom(
      interceptor.intercept(mockExecutionContext, mockCallHandler),
    );

    expect((result as ApiResponse<typeof data>).timestamp).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/,
    );
  });
});
