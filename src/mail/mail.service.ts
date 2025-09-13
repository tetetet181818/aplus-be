import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  public async register({
    email,
    confirmationURL,
  }: {
    email: string;
    confirmationURL: string;
  }) {
    try {
      const mailOptions = {
        to: email,
        subject: 'Register to my platform',
        template: 'register',
        context: {
          confirmationURL,
          appName: 'منصة أ+',
        },
      };

      await this.mailerService.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending login email:', error);
    }
  }
  // public async sendLoginEmail(name: string, email: string) {
  //   try {
  //     const mailOptions = {
  //       to: email,
  //       subject: 'Login to Your Account',
  //       template: 'login',
  //       context: {
  //         name,
  //         email,
  //       },
  //     };

  //     await this.mailerService.sendMail(mailOptions);
  //   } catch (error) {
  //     console.error('Error sending login email:', error);
  //   }
  // }

  /**
   * Send reset password email.
   */
  async forgetPassword({
    email,
    resetURL,
  }: {
    email: string;
    resetURL: string;
  }) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'إعادة تعيين كلمة المرور',
      template: 'forget-password',
      context: {
        resetURL,
        appName: 'منصة أ+',
      },
    });
  }
}
