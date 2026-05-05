import { DomainExceptionCode } from '@base-saas/shared';
import { describe, expect, it } from 'vitest';
import { DomainException } from '../../domain.exception';
import { EntityAlreadyExistsException } from './entity-already-exists.exception';

describe('EntityAlreadyExistsException', () => {
  const entityName = 'User';

  it('should be an instance of DomainException', () => {
    const exception = new EntityAlreadyExistsException(entityName);

    expect(exception).toBeInstanceOf(DomainException);
    expect(exception).toBeInstanceOf(Error);
  });

  it('should have correct message with entity name', () => {
    const exception = new EntityAlreadyExistsException(entityName);

    expect(exception.message).toBe('User already exists');
  });

  it('should have correct code', () => {
    const exception = new EntityAlreadyExistsException(entityName);

    expect(exception.code).toBe(DomainExceptionCode.ENTITY_ALREADY_EXISTS);
  });

  it('should have correct messageKey', () => {
    const exception = new EntityAlreadyExistsException(entityName);

    expect(exception.messageKey).toBe('errors.entityAlreadyExists');
  });

  it('should have correct messageArgs with entity', () => {
    const exception = new EntityAlreadyExistsException(entityName);

    expect(exception.messageArgs).toEqual({ entity: 'User' });
  });

  it('should have correct name', () => {
    const exception = new EntityAlreadyExistsException(entityName);

    expect(exception.name).toBe('EntityAlreadyExistsException');
  });

  it('should work with different entity names', () => {
    const exception = new EntityAlreadyExistsException('Organization');

    expect(exception.message).toBe('Organization already exists');
    expect(exception.messageArgs).toEqual({ entity: 'Organization' });
  });
});
