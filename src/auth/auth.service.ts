import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schemas/users.schema';
import { RegisterDto } from './dtos/register.dto';
import response from '../utils/response.pattern';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import {
  JwtPayload,
  RegisterPayload,
  ResetPasswordPayload,
} from '../utils/types';
import { LoginDto } from './dtos/login.dto';
import { MailService } from '../mail/mail.service';
import { UpdateUserDto } from './dtos/update-user.dto';

/**
 * Temporary payload stored inside the verification token.
 */

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('User')
    private readonly userModel: Model<User>,
    private readonly config: ConfigService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  public async getCurrentUser(id: string) {
    const user = await this.userModel
      .findOne({ _id: id })
      .select('-password')
      .lean();

    if (!user) {
      throw new NotFoundException('المستخدم غير موجود 🚫');
    }

    return response({
      message: 'تم العثور على المستخدم ✅',
      statusCode: 200,
      data: [user],
    });
  }

  /**
   * Register a new user:
   * - Generate a temporary JWT containing hashed credentials.
   * - Send confirmation link via email.
   */
  public async register(body: RegisterDto) {
    const { fullName, email, password, university } = body;

    const user = await this.userModel.findOne({ email });
    if (user) {
      throw new ConflictException(
        'هذا البريد الإلكتروني مستخدم بالفعل، جرّب بريد آخر 💌',
      );
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const payload: RegisterPayload = {
      fullName,
      email,
      password: hashedPassword,
      university,
    };

    const token = await this.jwtService.signAsync(payload, {
      secret: this.config.get<string>('JWT_SECRET'),
      expiresIn: this.config.get<string>('JWT_EXPIRES_IN'),
    });

    try {
      await this.mailService.register({
        email,
        confirmationURL: `${
          this.config.get<string>('NODE_ENV') === 'development'
            ? this.config.get<string>('FRONTEND_SERVER_DEVELOPMENT')
            : this.config.get<string>('FRONTEND_SERVER_PRODUCTION')
        }/verify?token=${token}`,
      });
    } catch (error) {
      console.error(`❌ Failed to send email to ${error}`);
      throw new BadRequestException('حدث خطأ أثناء إرسال البريد الإلكتروني 😢');
    }

    return response({
      message: 'تم إنشاء الحساب! تحقق من بريدك الإلكتروني لتفعيله 🎉',
      statusCode: 201,
    });
  }

  /**
   * Verify user email and create account if token is valid.
   */
  public async verify(token: string) {
    try {
      const decoded = await this.jwtService.verifyAsync<RegisterPayload>(
        token,
        {
          secret: this.config.get<string>('JWT_SECRET'),
        },
      );
      const exists = await this.userModel.findOne({ email: decoded.email });
      if (exists) {
        throw new ConflictException('هذا البريد مسجّل بالفعل 🚫');
      }

      const newUser = await this.userModel.create({
        fullName: decoded.fullName,
        email: decoded.email,
        password: decoded.password,
        university: decoded.university,
      });

      return response({
        message: '🎊 تم تفعيل حسابك بنجاح! يمكنك الآن استخدام المنصه 🚀',
        data: [{ id: newUser._id, email: newUser.email }],
        statusCode: 201,
      });
    } catch (err) {
      console.log(`⚠️ Invalid or expired token ${err}`);
      throw new BadRequestException('رابط التفعيل غير صالح أو منتهي ⏳');
    }
  }

  /**
   * Login existing user by validating email and password.
   */
  public async login(body: LoginDto) {
    const { email, password } = body;
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new NotFoundException(
        'لا يوجد حساب مرتبط بهذا البريد الإلكتروني 🔍',
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('بيانات الدخول غير صحيحة 😕');
    }

    const payload: JwtPayload = {
      id: user._id.toString(),
      role: user.role,
      email: user.email,
    };

    const token = await this.generateJwtToken(payload);

    return response({
      message: 'مرحباً بعودتك! تم تسجيل الدخول بنجاح ✅',
      token,
      statusCode: 200,
    });
  }

  /**
   * Request password reset:
   * - Generate a reset token (valid for 15 minutes).
   * - Send email with reset link.
   */
  public async forgetPassword(email: string) {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new NotFoundException(
        'لم يتم العثور على حساب بهذا البريد الإلكتروني 📭',
      );
    }

    const payload: ResetPasswordPayload = { email };
    const token = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
    });

    try {
      await this.mailService.forgetPassword({
        email,
        resetURL: `${
          this.config.get<string>('NODE_ENV') === 'development'
            ? this.config.get<string>('DEVELOPMENT_SERVER_DOMAIN')
            : this.config.get<string>('PRODUCTION_SERVER_DOMAIN')
        }/auth/reset-password?token=${token}`,
      });
    } catch (error) {
      console.error(`❌ Failed to send reset email to ${error}`);
      throw new BadRequestException('تعذر إرسال رابط إعادة التعيين 😔');
    }

    return response({
      message: 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني 📬',
      statusCode: 200,
    });
  }

  /**
   * Reset user password if token is valid.
   */
  public async resetPassword(token: string, newPassword: string) {
    try {
      const decoded =
        await this.jwtService.verifyAsync<ResetPasswordPayload>(token);

      const user = await this.userModel.findOne({ email: decoded.email });
      if (!user) {
        throw new NotFoundException('الحساب غير موجود 🔍');
      }

      const salt = await bcrypt.genSalt();
      user.password = await bcrypt.hash(newPassword, salt);
      await user.save();

      return response({
        message: 'تم تغيير كلمة المرور بنجاح، يمكنك تسجيل الدخول الآن 🔐',
        statusCode: 200,
      });
    } catch (err) {
      console.log(`⚠️ Invalid or expired reset token ${err}`);
      throw new BadRequestException('رابط إعادة التعيين غير صالح أو منتهي ⏳');
    }
  }

  /**
   * Logout user (frontend should delete token, here we just respond).
   */
  public logout(token: string) {
    console.log(`👋 User logged out with token: ${token}`);
    return response({
      message: 'تم تسجيل الخروج، نراك قريباً! 👋',
      statusCode: 200,
    });
  }

  /**
   * Delete user account permanently.
   */
  public async deleteAccount(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('الحساب غير موجود ❌');
    }

    await this.userModel.findByIdAndDelete(userId);

    return response({
      message: 'تم حذف الحساب نهائياً، نتمنى لك التوفيق 🍀',
      statusCode: 200,
    });
  }

  /**
   * Update user information (name, university, password).
   */
  public async updateUser(userId: string, body: UpdateUserDto) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('الحساب غير موجود ❌');
    }

    if (body.fullName) {
      user.fullName = body.fullName;
    }
    if (body.university) {
      user.university = body.university;
    }

    await user.save();

    return response({
      message: 'تم تحديث بياناتك بنجاح 🌟',
      data: [{ id: user._id, email: user.email }],
      statusCode: 200,
    });
  }

  /**
   * Generate JWT token for authenticated user.
   */
  private generateJwtToken(payload: JwtPayload): Promise<string> {
    return this.jwtService.signAsync(payload);
  }
}
