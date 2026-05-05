import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { IEmailService } from '../i.email.service';

@Injectable()
export class EmailService extends IEmailService {
  private readonly fromAddress: string;
  private readonly frontendUrl: string;
  private readonly resend: Resend;
  private readonly configService: ConfigService;

  public constructor(@Inject(ConfigService) configService: ConfigService) {
    super();
    this.configService = configService;
    this.fromAddress = this.configService.getOrThrow<string>('EMAIL_FROM');
    this.frontendUrl = this.configService.getOrThrow<string>('FRONTEND_URL');
    this.resend = new Resend(
      this.configService.getOrThrow<string>('RESEND_API_KEY'),
    );
  }

  public async sendPasswordResetEmail(
    to: string,
    resetToken: string,
  ): Promise<void> {
    const resetLink = `${this.frontendUrl}/reset-password?token=${resetToken}`;

    const subject = 'Redefinição de senha';
    const html = `<p>Clique <a href="${resetLink}">aqui</a> para redefinir sua senha. Este link expira em 1 hora.</p>`;

    await this.resend.emails.send({
      from: this.fromAddress,
      to,
      subject,
      html,
    });
  }
}
