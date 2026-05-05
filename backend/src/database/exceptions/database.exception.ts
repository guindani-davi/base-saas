import { DomainExceptionCode } from '@base-saas/shared';
import { DomainException } from '../../common/exceptions/domain/domain.exception';

export class DatabaseException extends DomainException {
  public constructor() {
    super(
      'An unexpected database error occurred',
      DomainExceptionCode.DATABASE_ERROR,
      'errors.databaseError',
    );
  }
}
