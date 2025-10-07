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
import { JwtPayload, RegisterPayload } from '../utils/types';
import { LoginDto } from './dtos/login.dto';
import { MailService } from '../mail/mail.service';
import { UpdateUserDto } from './dtos/update-user.dto';
import { randomBytes } from 'node:crypto';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { Note } from '../schemas/note.schema';
import { NotificationService } from '../notification/notification.service';

/**
 * Temporary payload stored inside the verification token.
 */

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('User')
    private readonly userModel: Model<User>,
    @InjectModel('Note')
    private readonly notesModel: Model<Note>,
    private readonly config: ConfigService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly notificationService: NotificationService,
  ) {}

  public async getCurrentUser(id: string) {
    const user = await this.userModel.findOne({ _id: id }).select('-password');

    if (!user) {
      throw new NotFoundException('المستخدم غير موجود 🚫');
    }

    //  Reset logic for monthly withdrawals
    const now = new Date();
    const lastReset = user.lastWithdrawalReset
      ? new Date(user.lastWithdrawalReset)
      : new Date(0);

    // if a new month has started, reset withdrawalTimes to 2
    if (
      now.getMonth() !== lastReset.getMonth() ||
      now.getFullYear() !== lastReset.getFullYear()
    ) {
      user.withdrawalTimes = 2;
      user.lastWithdrawalReset = now;
      await user.save();
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
      throw new UnauthorizedException('بيانات الدخول غير صحيحة ❌');
    }

    await this.notificationService.create({
      userId: user?._id.toString(),
      title: 'تسجيل دخول ناجح 🎉',
      message: `مرحباً ${user.fullName || 'بك'}! سعداء بعودتك معنا 🌟`,
    });

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

    user.resetPasswordToken = randomBytes(32).toString('hex');
    await user.save();

    try {
      await this.mailService.forgetPassword({
        email,
        resetURL: `${
          this.config.get<string>('NODE_ENV') === 'development'
            ? this.config.get<string>('FRONTEND_SERVER_DEVELOPMENT')
            : this.config.get<string>('FRONTEND_SERVER_PRODUCTION')
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        }/reset-password?userId=${user?._id}&resetPasswordToken=${user.resetPasswordToken}`,
      });
    } catch (error) {
      console.error(` Failed to send reset email to ${error}`);
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

  public async resetPassword(dto: ResetPasswordDto) {
    const { userId, resetPasswordToken, newPassword } = dto;
    try {
      const user = await this.userModel.findOne({ _id: userId });
      if (!user) {
        throw new NotFoundException('الحساب غير موجود 🔍');
      }

      if (
        user.resetPasswordToken === null ||
        user.resetPasswordToken !== resetPasswordToken
      ) {
        throw new BadRequestException(
          'رابط إعادة التعيين غير صالح أو منتهي ⏳',
        );
      }

      const salt = await bcrypt.genSalt();
      user.password = await bcrypt.hash(newPassword, salt);
      user.resetPasswordToken = null;
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

    if (body.university) {
      user.university = body.university;
    }

    await user.save();

    return response({
      message: 'تم تحديث بياناتك بنجاح 🌟',
      statusCode: 200,
    });
  }

  /**
   * 🔍 Retrieve a user by ID along with all their notes.
   * @param userId - The ID of the user to retrieve.
   * @returns Standardized response with user data and owned notes.
   * @throws NotFoundException if user does not exist.
   */
  public async getUserById(userId: string) {
    // Find user without password
    const user = await this.userModel
      .findById(userId)
      .select('-password')
      .lean();
    if (!user) {
      throw new NotFoundException('المستخدم غير موجود 🚫');
    }

    // Fetch notes owned by the user
    const notes = await this.notesModel.find({ owner_id: userId }).lean();

    return response({
      message: 'تم العثور على المستخدم ✅',
      statusCode: 200,
      data: {
        user,
        notes: notes.length > 0 ? notes : [],
      },
    });
  }

  /**
   * Generate JWT token for authenticated user.
   */
  private generateJwtToken(payload: JwtPayload): Promise<string> {
    return this.jwtService.signAsync(payload);
  }
}
