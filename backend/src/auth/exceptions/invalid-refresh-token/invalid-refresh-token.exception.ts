import { DomainExceptionCode } from '@base-saas/shared';
import { DomainException } from '../../../common/exceptions/domain/domain.exception';

export class InvalidRefreshTokenException extends DomainException {
  public constructor() {
    super(
      'Invalid or expired refresh token',
      DomainExceptionCode.INVALID_REFRESH_TOKEN,
      'errors.invalidRefreshToken',
    );
  }
}
