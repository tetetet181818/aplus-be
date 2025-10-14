import { Injectable } from '@nestjs/common';
import * as Nodemailer from 'nodemailer';
import { MailtrapTransport } from 'mailtrap';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private transporter;

  constructor(private readonly config: ConfigService) {
    const token = this.config.get<string>('SMTP_PASSWORD');

    // Create transporter using Mailtrap API (not SMTP)
    this.transporter = Nodemailer.createTransport(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call
      MailtrapTransport({
        token: token || '',
      }),
    );
  }

  async sendRegistrationEmail({
    email,
    confirmationURL,
  }: {
    email: string;
    confirmationURL: string;
  }) {
    const sender = {
      address: 'no-reply@aplusplatformsa.com',
      name: 'Aplus Platform',
    };

    const mail = {
      to: email,
      from: sender,
      email,
      subject: 'تأكيد التسجيل في منصة +A',
      text: `اضغط على الرابط لتأكيد التسجيل: ${confirmationURL}`,
      html: `<p>مرحبًا بك في <b>Aplus Platform</b>!</p>
             <p>اضغط على الرابط لتأكيد التسجيل:</p>
             <a href="${confirmationURL}">${confirmationURL}</a>`,
      category: 'Transactional',
    };

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const result = await this.transporter.sendMail(mail);
      console.log('✅ Registration email sent:', result);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return result;
    } catch (error) {
      console.error('❌ Error sending registration email:', error);
      throw error;
    }
  }
  async sendForgetPasswordEmail({
    email,
    resetURL,
  }: {
    email: string;
    resetURL: string;
  }) {
    const sender = {
      address: 'no-reply@aplusplatformsa.com',
      name: 'Aplus Platform',
    };

    const mail = {
      from: sender,
      to: email,
      subject: 'إعادة تعيين كلمة المرور - منصة +A',
      text: `لقد طلبت إعادة تعيين كلمة المرور. استخدم الرابط التالي لإعادة التعيين: ${resetURL}`,
      html: `<p>مرحبًا،</p>
             <p>لقد طلبت إعادة تعيين كلمة المرور لحسابك على <b>Aplus Platform</b>.</p>
             <p>اضغط على الرابط التالي لإعادة التعيين:</p>
             <a href="${resetURL}" target="_blank">${resetURL}</a>
             <p>إذا لم تطلب ذلك، يمكنك تجاهل هذه الرسالة.</p>`,
      category: 'Transactional',
    };

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const result = await this.transporter.sendMail(mail);
      console.log('Forget password email sent:', result);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return result;
    } catch (error) {
      console.error('Error sending forget password email:', error);
      throw error;
    }
  }
}
