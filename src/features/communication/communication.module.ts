import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { EmailService } from './email.service';
import { CommonConfig } from '../../common/common.config';

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: (commonConfig: CommonConfig) => {
        return {
          transport: {
            service: 'mailjet',
            auth: {
              // TODO: add into Communication Config
              user: process.env.MAILJET_API_KEY || '123',
              pass: process.env.MAILJET_SECRET_KEY || '123',
            },
          },
        };
      },
      inject: [CommonConfig],
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class CommunicationModule {}
