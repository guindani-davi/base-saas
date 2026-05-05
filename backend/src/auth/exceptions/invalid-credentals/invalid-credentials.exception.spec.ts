import { DomainExceptionCode } from '@base-saas/shared';
import { describe, expect, it } from 'vitest';
import { DomainException } from '../../../common/exceptions/domain/domain.exception';
import { InvalidCredentialsException } from './invalid-credentials.exception';

describe('InvalidCredentialsException', () => {
  it('should be an instance of DomainException', () => {
    const exception = new InvalidCredentialsException();

    expect(exception).toBeInstanceOf(DomainException);
    expect(exception).toBeInstanceOf(Error);
  });

  it('should have correct message', () => {
    const exception = new InvalidCredentialsException();

    expect(exception.message).toBe('Invalid email or password');
  });

  it('should have correct code', () => {
    const exception = new InvalidCredentialsException();

    expect(exception.code).toBe(DomainExceptionCode.INVALID_CREDENTIALS);
  });

  it('should have correct messageKey', () => {
    const exception = new InvalidCredentialsException();

    expect(exception.messageKey).toBe('errors.invalidCredentials');
  });

  it('should have correct name', () => {
    const exception = new InvalidCredentialsException();

    expect(exception.name).toBe('InvalidCredentialsException');
  });
});
