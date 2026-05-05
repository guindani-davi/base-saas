import { DomainExceptionCode } from '@base-saas/shared';
import { describe, expect, it } from 'vitest';
import { DomainException } from '../../domain.exception';
import { EntityNotFoundException } from './entity-not-found.exception';

describe('EntityNotFoundException', () => {
  const entityName = 'User';

  it('should be an instance of DomainException', () => {
    const exception = new EntityNotFoundException(entityName);

    expect(exception).toBeInstanceOf(DomainException);
    expect(exception).toBeInstanceOf(Error);
  });

  it('should have correct message with entity name', () => {
    const exception = new EntityNotFoundException(entityName);

    expect(exception.message).toBe('User was not found');
  });

  it('should have correct code', () => {
    const exception = new EntityNotFoundException(entityName);

    expect(exception.code).toBe(DomainExceptionCode.ENTITY_NOT_FOUND);
  });

  it('should have correct messageKey', () => {
    const exception = new EntityNotFoundException(entityName);

    expect(exception.messageKey).toBe('errors.entityNotFound');
  });

  it('should have correct messageArgs with entity', () => {
    const exception = new EntityNotFoundException(entityName);

    expect(exception.messageArgs).toEqual({ entity: 'User' });
  });

  it('should have correct name', () => {
    const exception = new EntityNotFoundException(entityName);

    expect(exception.name).toBe('EntityNotFoundException');
  });

  it('should work with different entity names', () => {
    const exception = new EntityNotFoundException('Organization');

    expect(exception.message).toBe('Organization was not found');
    expect(exception.messageArgs).toEqual({ entity: 'Organization' });
  });
});
