import { DomainExceptionCode } from '@base-saas/shared';
import { DomainException } from '../../domain.exception';

export class EntityNotFoundException extends DomainException {
  public constructor(entity: string) {
    super(
      `${entity} was not found`,
      DomainExceptionCode.ENTITY_NOT_FOUND,
      'errors.entityNotFound',
      { entity },
    );
  }
}
