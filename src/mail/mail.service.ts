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
   * Send registration confirmation email.
   */
  public async register({
    email,
    confirmationURL,
  }: RegisterMailPayload): Promise<void> {
    const html = `
      <!doctype html>
      <html lang="ar" dir="rtl">
        <body style="margin:0;padding:0;background:#f5f7fa;font-family:Tahoma,Arial,sans-serif;">
          <table role="presentation" width="100%" style="background:#f5f7fa;padding:20px 0;">
            <tr>
              <td align="center">
                <table role="presentation" width="640" style="max-width:640px;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 10px 25px rgba(0,0,0,0.05);border:1px solid #eaeaea;">
                  <tr>
                    <td align="center" style="padding:35px 30px;background:linear-gradient(135deg,#3498db 0%,#2c3e50 100%);color:#fff;">
                      <div style="font-size:36px;width:80px;height:80px;border-radius:50%;background:rgba(255,255,255,0.2);line-height:80px;margin-bottom:20px;">✉️</div>
                      <h1 style="margin:10px 0 8px;font-size:28px;font-weight:700;">تأكيد بريدك الإلكتروني</h1>
                      <p style="margin:0;font-size:16px;opacity:0.9;">مرحبًا بك في منصتنا! نحن سعداء بانضمامك إلينا</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:35px 30px;color:#1a202c;line-height:1.6;">
                      <p style="margin-bottom:18px;">مرحبًا! اضغط الزر التالي لتفعيل حسابك:</p>
                      <table role="presentation" align="center" style="margin:20px auto;">
                        <tr>
                          <td align="center" bgcolor="#3498db" style="border-radius:50px;">
                            <a href="${confirmationURL}" target="_blank"
                              style="display:inline-block;background:linear-gradient(135deg,#3498db 0%,#2c3e50 100%);
                                     color:#fff;text-decoration:none;padding:14px 28px;border-radius:50px;
                                     font-weight:700;font-size:16px;box-shadow:0 4px 15px rgba(52,152,219,0.3);">
                              تأكيد البريد الآن
                            </a>
                          </td>
                        </tr>
                      </table>
                      <div style="background:#fffaf0;border-right:4px solid #f6ad55;padding:15px;border-radius:8px;font-size:14px;color:#553c02;">
                        <strong>ملاحظة:</strong>
                        وصلت هذه الرسالة لأن بريدك الإلكتروني استُخدم للتسجيل في منصة أ+. إذا لم تكن أنت من قام بذلك، يمكنك تجاهل هذه الرسالة بأمان.
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="background:#f8f9fa;padding:25px 30px;color:#718096;font-size:13px;border-top:1px solid #eaeaea;">
                      <p style="margin:0;">© ${new Date().getFullYear()} منصة أ+. جميع الحقوق محفوظة.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
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
   * Send password reset email.
   */
  public async forgetPassword({
    email,
    resetURL,
  }: ForgetPasswordMailPayload): Promise<void> {
    const html = `
      <!doctype html>
      <html lang="ar" dir="rtl">
        <body style="margin:0;padding:0;background:#f5f7fa;font-family:Tahoma,Arial,sans-serif;">
          <table role="presentation" width="100%" style="background:#f5f7fa;padding:20px 0;">
            <tr>
              <td align="center">
                <table role="presentation" width="640" style="max-width:640px;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 10px 25px rgba(0,0,0,0.05);border:1px solid #eaeaea;">
                  <tr>
                    <td align="center" style="padding:35px 30px;background:#e74c3c;color:#fff;">
                      <h1 style="margin:0;font-size:24px;font-weight:700;">إعادة تعيين كلمة المرور</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:35px 30px;color:#1a202c;line-height:1.6;">
                      <p>مرحبًا! لقد طلبت إعادة تعيين كلمة المرور الخاصة بك.</p>
                      <p>اضغط على الزر أدناه لتغيير كلمة المرور:</p>
                      <table role="presentation" align="center" style="margin:20px auto;">
                        <tr>
                          <td align="center" bgcolor="#e74c3c" style="border-radius:50px;">
                            <a href="${resetURL}"
                              style="display:inline-block;background:#e74c3c;color:#fff;text-decoration:none;
                                     padding:14px 28px;border-radius:50px;font-weight:700;font-size:16px;">
                              إعادة التعيين الآن
                            </a>
                          </td>
                        </tr>
                      </table>
                      <p style="font-size:14px;color:#555;">
                        إذا لم تكن أنت من طلب إعادة التعيين، يمكنك تجاهل هذه الرسالة بأمان.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="background:#f8f9fa;padding:25px 30px;color:#718096;font-size:13px;border-top:1px solid #eaeaea;">
                      <p style="margin:0;">© ${new Date().getFullYear()} منصة أ+. جميع الحقوق محفوظة.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
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
