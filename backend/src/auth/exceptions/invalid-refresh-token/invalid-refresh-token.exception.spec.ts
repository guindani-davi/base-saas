import { DomainExceptionCode } from '@base-saas/shared';
import { describe, expect, it } from 'vitest';
import { DomainException } from '../../../common/exceptions/domain/domain.exception';
import { InvalidRefreshTokenException } from './invalid-refresh-token.exception';

describe('InvalidRefreshTokenException', () => {
  it('should be an instance of DomainException', () => {
    const exception = new InvalidRefreshTokenException();

    expect(exception).toBeInstanceOf(DomainException);
    expect(exception).toBeInstanceOf(Error);
  });

  it('should have correct message', () => {
    const exception = new InvalidRefreshTokenException();

    expect(exception.message).toBe('Invalid or expired refresh token');
  });

  it('should have correct code', () => {
    const exception = new InvalidRefreshTokenException();

    expect(exception.code).toBe(DomainExceptionCode.INVALID_REFRESH_TOKEN);
  });

  it('should have correct messageKey', () => {
    const exception = new InvalidRefreshTokenException();

    expect(exception.messageKey).toBe('errors.invalidRefreshToken');
  });

  it('should have correct name', () => {
    const exception = new InvalidRefreshTokenException();

    expect(exception.name).toBe('InvalidRefreshTokenException');
  });
});
