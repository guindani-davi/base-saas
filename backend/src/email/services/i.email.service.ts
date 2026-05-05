import { PasswordResetToken } from '@base-saas/shared';
import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class IEmailService {
  public abstract sendPasswordResetEmail(
    to: string,
    resetToken: PasswordResetToken['hashedToken'],
  ): Promise<void>;
}
