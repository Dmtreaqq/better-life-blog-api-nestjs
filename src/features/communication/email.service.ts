import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  constructor(private mailerService: MailerService) {}

  async sendConfirmationEmail(confirmCode: string, toEmail: string) {
    const content = `
        <h1>Thank for your registration</h1>
            <p>To finish registration please follow the link below:
            <a href='https://somesite.com/confirm-email?code=${confirmCode}'>complete registration</a>
        </p>
        `;

    await this.mailerService.sendMail({
      from: '"Dmytro Pavlov 👻" <dmytro@modern-med.space>',
      to: toEmail,
      subject: 'Blog - Confirm Email ✔',
      text: 'Welcome to BetterLifeBlog',
      html: content,
    });

    console.log('Email sent');
  }

  async sendRecoverPasswordEmail(recoveryCode: string, toEmail: string) {
    const content = `
      <h1>Password recovery</h1>
        <p>To finish password recovery please follow the link below:
          <a href='https://somesite.com/password-recovery?recoveryCode=${recoveryCode}'>recovery password</a>
        </p>
      `;

    await this.mailerService.sendMail({
      from: '"Dmytro Pavlov 👻" <dmytro@modern-med.space>',
      to: toEmail,
      subject: 'Blog - Recover Password ✔',
      text: 'Welcome to BetterLifeBlog',
      html: content,
    });

    console.log('Email sent');
  }
}
