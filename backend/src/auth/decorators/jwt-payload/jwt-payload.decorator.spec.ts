import type { JwtPayload } from '@base-saas/shared';
import { Controller, ExecutionContext, Get } from '@nestjs/common';
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';
import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { ExtractJwtPayload } from './jwt-payload.decorator';

@Controller('test')
class TestController {
  @Get()
  public getPayload(@ExtractJwtPayload() payload: JwtPayload): JwtPayload {
    return payload;
  }
}

function getParamDecoratorFactory(decorator: () => ParameterDecorator) {
  @Controller('test')
  class TestDecoratorController {
    public test(@decorator() _value: unknown): void {}
  }

  const metadata = Reflect.getMetadata(
    ROUTE_ARGS_METADATA,
    TestDecoratorController,
    'test',
  );
  const key = Object.keys(metadata)[0];
  return metadata[key].factory;
}

describe('ExtractJwtPayload', () => {
  let testController: TestController;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [TestController],
    }).compile();

    testController = moduleRef.get(TestController);
  });

  describe('decorator factory', () => {
    const createMockExecutionContext = (user: unknown): ExecutionContext => {
      return {
        switchToHttp: () => ({
          getRequest: () => ({ user }),
          getResponse: () => ({}),
          getNext: () => ({}),
        }),
        getClass: () => TestController,
        getHandler: () => TestController.prototype.getPayload,
        getArgs: () => [],
        getArgByIndex: () => ({}),
        switchToRpc: () => ({}) as ReturnType<ExecutionContext['switchToRpc']>,
        switchToWs: () => ({}) as ReturnType<ExecutionContext['switchToWs']>,
        getType: () => 'http',
      } as ExecutionContext;
    };

    it('should extract payload from request.user', () => {
      const mockPayload: JwtPayload = { sub: 'user-123' };
      const ctx = createMockExecutionContext(mockPayload);

      const factory = getParamDecoratorFactory(ExtractJwtPayload);
      const result = factory(undefined, ctx);

      expect(result).toBe(mockPayload);
      expect(result.sub).toBe('user-123');
    });

    it('should return undefined when user is not set', () => {
      const ctx = createMockExecutionContext(undefined);

      const factory = getParamDecoratorFactory(ExtractJwtPayload);
      const result = factory(undefined, ctx);

      expect(result).toBeUndefined();
    });

    it('should return the exact user object without transformation', () => {
      const mockPayload: JwtPayload = { sub: 'user-456' };
      const ctx = createMockExecutionContext(mockPayload);

      const factory = getParamDecoratorFactory(ExtractJwtPayload);
      const result = factory(undefined, ctx);

      expect(result).toBe(mockPayload);
    });
  });

  describe('controller integration', () => {
    it('should be defined on test controller', () => {
      expect(testController).toBeDefined();
      expect(testController.getPayload).toBeDefined();
    });
  });
});
