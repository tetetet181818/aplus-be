import { BadRequestException, Injectable } from '@nestjs/common';
import * as Nodemailer from 'nodemailer';
import { MailtrapTransport } from 'mailtrap';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  public transporter;

  constructor(private readonly config: ConfigService) {
    const token = this.config.get<string>('mail.smtpPassword');

    // Create transporter using Mailtrap API (not SMTP)
    this.transporter = Nodemailer.createTransport(
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
      subject: 'تأكيد التسجيل في منصة أ+',
      text: `اضغط على الرابط لتأكيد التسجيل: ${confirmationURL}`,
      html: `
            <!DOCTYPE html>
            <html dir="rtl" lang="ar">
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; direction: rtl; background: #f8fafc; margin: 0; padding: 40px 20px; }
                    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; color: white; }
                    .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
                    .body { padding: 40px; text-align: center; }
                    .welcome { font-size: 24px; color: #1f2937; margin-bottom: 20px; }
                    .message { color: #6b7280; line-height: 1.6; margin-bottom: 30px; }
                    .button { display: inline-block; background: #3b82f6; color: white; padding: 16px 40px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px; margin: 20px 0; }
                    .footer { background: #f8fafc; padding: 30px; text-align: center; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="logo"> منصة أ+ </div>
                    </div>
                    <div class="body">
                        <div class="welcome">🎉 مرحبًا بك في منصة A+!</div>
                        <div class="message">
                            نحن سعداء بانضمامك إلى مجتمعنا التعليمي. 
                            <br>لبدء رحلة التعلم، يرجى تأكيد بريدك الإلكتروني:
                        </div>
                        <a href="${confirmationURL}" class="button">✅ تأكيد حسابي</a>
                    </div>
                    <div class="footer">
                        © 2024 منصة أ+. جميع الحقوق محفوظة.
                    </div>
                </div>
            </body>
            </html>
            `,
      category: 'Transactional',
    };

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const result = await this.transporter.sendMail(mail);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return result;
    } catch (error) {
      throw new BadRequestException(error);
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
      subject: 'إعادة تعيين كلمة المرور - منصة أ+',
      text: `لقد طلبت إعادة تعيين كلمة المرور. استخدم الرابط التالي لإعادة التعيين: ${resetURL}`,
      html: `
              <!DOCTYPE html>
              <html dir="rtl" lang="ar">
              <head>
                  <meta charset="UTF-8">
                  <style>
                      body { font-family: 'Tajawal', 'Segoe UI', sans-serif; direction: rtl; background: #f8fafc; margin: 0; padding: 40px 20px; }
                      .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1); }
                      .header { background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); padding: 50px 40px; text-align: center; color: white; }
                      .logo { font-size: 32px; font-weight: bold; margin-bottom: 15px; }
                      .body { padding: 50px 40px; text-align: center; }
                      .title { font-size: 28px; color: #1f2937; margin-bottom: 25px; font-weight: 700; }
                      .message { color: #6b7280; line-height: 1.8; margin-bottom: 25px; text-align: center; }
                      .button { display: inline-block; background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; padding: 18px 45px; text-decoration: none; border-radius: 50px; font-weight: 700; font-size: 17px; margin: 30px 0; box-shadow: 0 6px 20px 0 rgba(238, 90, 36, 0.3); }
                      .manual-link { word-break: break-all; color: #ee5a24; text-decoration: none; background: #fff5f5; padding: 12px 16px; border-radius: 8px; display: inline-block; margin: 20px 0; border: 1px solid #fed7d7; }
                      .security { background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 12px; padding: 25px; margin: 30px 0; text-align: right; }
                      .footer { background: #f8fafc; padding: 40px; text-align: center; color: #6b7280; border-top: 1px solid #e5e7eb; }
                      .urgency { background: #dc2626; color: white; padding: 8px 16px; border-radius: 20px; font-size: 12px; font-weight: 600; display: inline-block; margin-bottom: 20px; }
                  </style>
              </head>
              <body>
                  <div class="container">
                      <div class="header">
                          <div style="font-size: 48px; margin-bottom: 20px;">🔒</div>
                          <div class="logo">A+ Platform</div>
                          <div>إعادة تعيين كلمة المرور</div>
                      </div>
                      <div class="body">
                          <div class="urgency">⏰ هذا الرابط صالح لمدة ساعة واحدة</div>
                          <div class="title">إعادة تعيين كلمة المرور</div>
                          <div class="message">
                              مرحبًا،<br>
                              لقد تلقينا طلبًا لإعادة تعيين كلمة المرور لحسابك على <strong>A+ Platform</strong>.
                          </div>
                          <a href="${resetURL}" class="button">🔄 إعادة تعيين كلمة المرور</a>
                          <div class="security">
                              <div style="font-weight: 700; color: #0369a1; margin-bottom: 10px;">🔐 نصائح أمان:</div>
                              <div style="color: #6b7280; font-size: 14px; line-height: 1.8;">
                                  • لا تشارك هذا الرابط مع أي شخص<br>
                                  • اختر كلمة مرور قوية وفريدة<br>
                                  • إذا لم تطلب هذا، تجاهل الرسالة
                              </div>
                          </div>
                      </div>
                      <div class="footer">
                          <div style="margin-bottom: 15px;">© 2024 A+ Platform. جميع الحقوق محفوظة.</div>
                          <div style="font-size: 13px; color: #9ca3af;">هذا البريد الإلكتروني مرسل تلقائيًا، يرجى عدم الرد عليه.</div>
                      </div>
                  </div>
              </body>
              </html>
              `,
      category: 'Transactional',
    };

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const result = await this.transporter.sendMail(mail);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return result;
    } catch (error) {
      console.error('Error sending forget password email:', error);
      throw error;
    }
  }
}
