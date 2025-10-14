import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

interface RegisterMailPayload {
  email: string;
  confirmationURL: string;
}

interface ForgetPasswordMailPayload {
  email: string;
  resetURL: string;
}

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  /**
   * Send registration confirmation email (simple, lightweight template)
   */
  public async register({
    email,
    confirmationURL,
  }: RegisterMailPayload): Promise<void> {
    const html = `
      <div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;background:#fafafa;padding:24px;color:#333;">
        <h2 style="text-align:center;color:#2c3e50;">تأكيد بريدك الإلكتروني</h2>
        <p>مرحبًا بك! اضغط الزر التالي لتفعيل حسابك في منصة أ+:</p>
        <div style="text-align:center;margin:24px 0;">
          <a href="${confirmationURL}" 
             style="background:#2c3e50;color:#fff;text-decoration:none;
                    padding:10px 20px;border-radius:6px;font-weight:bold;">
             تأكيد البريد الآن
          </a>
        </div>
        <p style="font-size:14px;color:#666;">
          إذا لم تكن أنت من قام بالتسجيل، يمكنك تجاهل هذه الرسالة.
        </p>
        <hr style="border:none;border-top:1px solid #ddd;margin:20px 0;" />
        <p style="font-size:12px;text-align:center;color:#999;">
          © ${new Date().getFullYear()} منصة أ+. جميع الحقوق محفوظة.
        </p>
      </div>
    `;

    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'تأكيد التسجيل في منصة أ+',
        html,
      });
    } catch (error) {
      console.error('Error sending registration email:', error);
    }
  }

  /**
   * Send password reset email (simple, lightweight template)
   */
  public async forgetPassword({
    email,
    resetURL,
  }: ForgetPasswordMailPayload): Promise<void> {
    const html = `
      <div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;background:#fafafa;padding:24px;color:#333;">
        <h2 style="text-align:center;color:#e74c3c;">إعادة تعيين كلمة المرور</h2>
        <p>لقد طلبت إعادة تعيين كلمة المرور الخاصة بك.</p>
        <div style="text-align:center;margin:24px 0;">
          <a href="${resetURL}" 
             style="background:#e74c3c;color:#fff;text-decoration:none;
                    padding:10px 20px;border-radius:6px;font-weight:bold;">
             إعادة التعيين الآن
          </a>
        </div>
        <p style="font-size:14px;color:#666;">
          إذا لم تكن أنت من طلب إعادة التعيين، يمكنك تجاهل هذه الرسالة.
        </p>
        <hr style="border:none;border-top:1px solid #ddd;margin:20px 0;" />
        <p style="font-size:12px;text-align:center;color:#999;">
          © ${new Date().getFullYear()} منصة أ+. جميع الحقوق محفوظة.
        </p>
      </div>
    `;

    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'إعادة تعيين كلمة المرور',
        html,
      });
    } catch (error) {
      console.error('Error sending reset password email:', error);
    }
  }
}
