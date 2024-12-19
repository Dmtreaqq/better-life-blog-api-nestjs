import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { EmailService } from './email.service';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        service: 'mailjet',
        auth: {
          user: process.env.MAILJET_API_KEY || '123',
          pass: process.env.MAILJET_SECRET_KEY || '123',
        },
      },
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class CommunicationModule {}
