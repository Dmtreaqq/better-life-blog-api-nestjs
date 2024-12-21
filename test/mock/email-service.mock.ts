import { EmailService } from '../../src/features/communication/email.service';

export class EmailServiceMock extends EmailService {
  async sendConfirmationEmail(
    confirmCode: string,
    toEmail: string,
  ): Promise<void> {
    console.log('Confirm mock email sent');

    return Promise.resolve();
  }

  async sendRecoverPasswordEmail(
    recoveryCode: string,
    toEmail: string,
  ): Promise<void> {
    console.log('Recover mock email sent');

    return Promise.resolve();
  }
}
