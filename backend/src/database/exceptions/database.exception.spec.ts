import { DomainExceptionCode } from '@base-saas/shared';
import { describe, expect, it } from 'vitest';
import { DomainException } from '../../common/exceptions/domain/domain.exception';
import { DatabaseException } from './database.exception';

describe('DatabaseException', () => {
  it('should be an instance of DomainException', () => {
    const exception = new DatabaseException();

    expect(exception).toBeInstanceOf(DomainException);
    expect(exception).toBeInstanceOf(Error);
  });

  it('should have correct message', () => {
    const exception = new DatabaseException();

    expect(exception.message).toBe('An unexpected database error occurred');
  });

  it('should have correct code', () => {
    const exception = new DatabaseException();

    expect(exception.code).toBe(DomainExceptionCode.DATABASE_ERROR);
  });

  it('should have correct messageKey', () => {
    const exception = new DatabaseException();

    expect(exception.messageKey).toBe('errors.databaseError');
  });

  it('should have correct name', () => {
    const exception = new DatabaseException();

    expect(exception.name).toBe('DatabaseException');
  });
});
