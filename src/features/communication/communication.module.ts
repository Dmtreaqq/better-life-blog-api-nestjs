import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { EmailService } from './email.service';
import { CommunicationConfig } from './communication.config';

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: (communicationConfig: CommunicationConfig) => {
        return {
          transport: {
            service: 'mailjet',
            auth: {
              user: communicationConfig.mailJetApiKey,
              pass: communicationConfig.mailJetSecretKey,
            },
          },
        };
      },
      inject: [CommunicationConfig],
      // TODO: почему не работало иначе, когда помещал в Providers ??
      extraProviders: [CommunicationConfig],
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class CommunicationModule {}
