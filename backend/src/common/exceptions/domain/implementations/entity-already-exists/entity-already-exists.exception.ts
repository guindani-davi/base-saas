import { DomainExceptionCode } from '@base-saas/shared';
import { DomainException } from '../../domain.exception';

export class EntityAlreadyExistsException extends DomainException {
  public constructor(entity: string) {
    super(
      `${entity} already exists`,
      DomainExceptionCode.ENTITY_ALREADY_EXISTS,
      'errors.entityAlreadyExists',
      { entity },
    );
  }
}
