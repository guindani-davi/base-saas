import { DomainExceptionCode } from '@base-saas/shared';
import { DomainException } from '../../../common/exceptions/domain/domain.exception';

export class InvalidCredentialsException extends DomainException {
  public constructor() {
    super(
      'Invalid email or password',
      DomainExceptionCode.INVALID_CREDENTIALS,
      'errors.invalidCredentials',
    );
  }
}
