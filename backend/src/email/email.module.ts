import { Module } from '@nestjs/common';
import { IEmailService } from './services/i.email.service';
import { EmailService } from './services/implementations/email.service';

@Module({
  providers: [{ provide: IEmailService, useClass: EmailService }],
  exports: [IEmailService],
})
export class EmailModule {}
