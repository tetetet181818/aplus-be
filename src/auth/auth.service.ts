import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schemas/users.schema';
import { RegisterDto } from './dtos/register.dto';
import response from '../utils/response.pattern';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { GoogleAuthRequest, JwtPayload } from '../utils/types';
import { LoginDto } from './dtos/login.dto';
import { MailService } from '../mail/mail.service';
import { UpdateUserDto } from './dtos/update-user.dto';
import { randomBytes } from 'node:crypto';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { Note } from '../schemas/note.schema';
import { NotificationService } from '../notification/notification.service';
import type { Response } from 'express';
import { COOKIE_NAME, REFRESH_COOKIE_NAME } from '../utils/constants';
import { AwsService } from '../aws/aws.service';
import {Express} from "express"
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
    private readonly awsService: AwsService,
  ) {}

  public async getCurrentUser(id: string) {
    if (!id) {
      throw new UnauthorizedException('المستخدم غير موجود 🚫');
    }

    const user = await this.userModel.findById(id).select('-password');

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

    if (user?.numberOfSales > 20) {
      user.badgeSales = true;
      await user.save();
      await this.notificationService.create({
        userId: user._id.toString(),
        title: '🏅 تهانينا! لقد حصلت على شارة البائع المميز',
        message: 'أنت الآن بائع مميز! شكرًا لمساهمتك القيمة في المنصة.',
        type: 'success',
      });
    }

    return response({
      message: 'تم العثور على المستخدم',
      statusCode: 200,
      data: user,
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

    let finalFullName = fullName.trim().replace(/\s+/g, '');
    const existingUser = await this.userModel.findOne({
      fullName: finalFullName,
    });

    if (existingUser) {
      const randomSuffix = Math.random().toString(36).substring(2, 6);
      const randomNumber = Math.floor(Math.random() * 9999);
      finalFullName = `${finalFullName}_${randomSuffix}${randomNumber}`;
    }

    const hashedPassword = await this.hashPassword(password || '');

    const payload = {
      fullName: finalFullName,
      email,
      password: hashedPassword,
      university,
      role: 'student',
    };

    const token = await this.generateJwtToken(payload);

    try {
      await this.mailService.sendRegistrationEmail({
        email,
        confirmationURL: `${
          this.config.get<string>('NODE_ENV') === 'development'
            ? this.config.get<string>('FRONTEND_SERVER_DEVELOPMENT')
            : this.config.get<string>('FRONTEND_SERVER_PRODUCTION')
        }/verify?token=${token}`,
      });
    } catch (error) {
      console.error(`❌ Failed to send email: ${error}`);
      throw new BadRequestException('حدث خطأ أثناء إرسال البريد الإلكتروني 😢');
    }

    return response({
      message: `تم إنشاء الحساب باسم المستخدم: ${finalFullName} ✅ تحقق من بريدك الإلكتروني لتفعيله 🎉`,
      statusCode: 201,
    });
  }

  /**
   * Verify user email and create account if token is valid.
   */
  public async verify(token: string, res: Response) {
    try {
      const decoded = await this.verifyToken(token);

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

      if (!newUser) {
        throw new BadRequestException('حدث خطاء في انشاء الحساب');
      }

      await this.notificationService.create({
        userId: newUser._id.toString(),
        title: '🎉 تم تفعيل حسابك بنجاح!',
        message:
          'أهلاً وسهلاً بك في +A! تم تفعيل حسابك بنجاح، ويمكنك الآن الاستمتاع بكامل مزايا المنصة واستكشاف المحتوى المميز 🚀✨',
        type: 'success',
      });

      const tokens = await this.getTokens(
        newUser._id.toString(),
        newUser.role,
        newUser.email,
        newUser.fullName,
      );

      await this.updateRefreshToken(
        newUser._id.toString(),
        tokens.refreshToken,
      );

      this.setCookies(res, tokens.accessToken, tokens.refreshToken);

      return response({
        message: '🎊 تم تفعيل حسابك بنجاح! يمكنك الآن استخدام المنصه 🚀',
        data: newUser,
        statusCode: 201,
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      throw new BadRequestException('رابط التفعيل غير صالح أو منتهي ⏳');
    }
  }

  /**
   * Login existing user by validating email and password.
   */
  public async login(body: LoginDto, res: Response) {
    const { email, password } = body;
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new NotFoundException(
        'لا يوجد حساب مرتبط بهذا البريد الإلكتروني 🔍',
      );
    }

    const isMatch = await bcrypt.compare(password, user.password || '');

    if (!isMatch) {
      throw new UnauthorizedException('بيانات الدخول غير صحيحة ❌');
    }

    await this.notificationService.create({
      userId: user?._id.toString(),
      title: 'تسجيل دخول ناجح 🎉',
      message: `مرحباً ${user.fullName || 'بك'}! سعداء بعودتك معنا 🌟`,
      type: 'success',
    });

    const tokens = await this.getTokens(
      user._id.toString(),
      user.role,
      user.email,
      user.fullName,
    );
    await this.updateRefreshToken(user._id.toString(), tokens.refreshToken);
    this.setCookies(res, tokens.accessToken, tokens.refreshToken);

    return response({
      message: 'مرحباً بعودتك! تم تسجيل الدخول بنجاح ✅',
      statusCode: 200,
    });
  }

  // public logout(res: Response) {
  //   this.removeCookies(res);
  //   return response({
  //     message: 'تم تسجيل الخروج بنجاح ✅',
  //     statusCode: 200,
  //   });
  // }

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
    user.resetPasswordExpires = Date.now() + 5 * 60 * 1000;
    await user.save();

    try {
      await this.mailService.sendForgetPasswordEmail({
        email,
        resetURL: `${
          this.config.get<string>('NODE_ENV') === 'development'
            ? this.config.get<string>('FRONTEND_SERVER_DEVELOPMENT')
            : this.config.get<string>('FRONTEND_SERVER_PRODUCTION')
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        }/reset-password?userId=${user?._id}&resetPasswordToken=${user.resetPasswordToken}`,
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
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
        user.resetPasswordToken !== resetPasswordToken ||
        user.resetPasswordExpires < Date.now()
      ) {
        throw new BadRequestException(
          'رابط إعادة التعيين غير صالح أو منتهي ⏳',
        );
      }

      const salt = await bcrypt.genSalt();
      user.password = await bcrypt.hash(newPassword, salt);
      user.resetPasswordToken = null;
      await user.save();

      await this.notificationService.create({
        userId: user?._id.toString(),
        title: 'تم تغيير كلمة المرور بنجاح 🔐',
        message: `تم تغيير كلمة المرور بنجاح، يمكنك تسجيل الدخول الآن 🔐`,
      });

      return response({
        message: 'تم تغيير كلمة المرور بنجاح، يمكنك تسجيل الدخول الآن 🔐',
        statusCode: 200,
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      throw new BadRequestException('رابط إعادة التعيين غير صالح أو منتهي ⏳');
    }
  }

  /**
   * Delete user account permanently.
   */
  public async deleteAccount(userId: string) {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new NotFoundException('الحساب غير موجود ❌');
    }

    const deletedUser = await this.userModel.findByIdAndDelete(userId);

    if (!deletedUser) {
      throw new BadRequestException('حدث خطاء في حذف الحساب');
    }

    return response({
      message: 'تم حذف الحساب نهائياً، نتمنى لك التوفيق 🍀',
      statusCode: 200,
    });
  }

  /**
   * Update user information (university).
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

  public async getBestSellers() {
    const users = await this.userModel
      .find()
      .sort({ createdAt: -1 })
      .select('fullName email university numberOfSales')
      .lean();

    const bestSellersUsers = users
      .filter((user) => user.numberOfSales > 0)
      .sort((a, b) => b.numberOfSales - a.numberOfSales)
      .slice(0, 5);

    return response({
      message: 'تم جلب أفضل البائعين بنجاح ✅',
      statusCode: 200,
      data: bestSellersUsers,
    });
  }

  public async updateAvatar(userId: string, file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('يجب تحميل صورة 📷');
    }

    try {
      const avatarUrl = await this.awsService.uploadAvatar(file);

      const user = await this.userModel.findByIdAndUpdate(
        userId,
        { avatar: avatarUrl },
        { new: true },
      );

      return response({
        message: 'تم تحديث الصورة الشخصية بنجاح 🌟',
        statusCode: 200,
        data: user,
      });
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'حدث خطأ غير متوقع أثناء تحديث الصورة الشخصية ⚠️',
      );
    }
  }

  /**
   * Retrieve a user by ID along with all their notes.
   * @param userId - The ID of the user to retrieve.
   * @returns Standardized response with user data and owned notes.
   * @throws NotFoundException if user does not exist.
   */
  public async getUserById(userId: string) {
    if (!userId) {
      throw new UnauthorizedException('المستخدم غير موجود 🚫');
    }
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
        notes,
      },
    });
  }

  public async googleLogin(req: GoogleAuthRequest, res: Response) {
    if (!req.user) {
      return 'No user from Google';
    }

    const userData = req.user;

    let user = await this.userModel.findOne({ email: userData.email });

    if (!user) {
      user = await this.userModel.create({
        fullName: `${userData.firstName} ${userData.lastName}`,
        email: userData.email,
        role: 'student',
        provider: 'google',
      });
    }

    const tokens = await this.getTokens(
      user._id.toString(),
      user.role,
      user.email,
      user.fullName,
    );

    await this.updateRefreshToken(user._id.toString(), tokens.refreshToken);
    this.setCookies(res, tokens.accessToken, tokens.refreshToken);

    res.redirect(`${this.config.get<string>('FRONTEND_SERVER_PRODUCTION')}/`);
    return response({
      message: 'User authenticated successfully',
      data: user,
      statusCode: 200,
    });
  }

  public async getAllUsers(page: number, limit: number, fullName: string) {
    const currentPage = Math.max(1, page);
    const pageSize = Math.max(1, limit);
    const skip = (currentPage - 1) * pageSize;

    const filters: Record<string, any> = {};

    if (fullName) {
      filters.fullName = { $regex: fullName, $options: 'i' };
    }

    if (!fullName || fullName.trim() === '') {
      return response({
        message: 'يرجى إدخال اسم المستخدم للبحث',
        data: { data: [], pagnation: null },
        statusCode: 200,
      });
    }

    const users = await this.userModel
      .find(filters)
      .skip(skip)
      .limit(pageSize)
      .select('_id fullName email')
      .lean();

    const totalUsers = await this.userModel.countDocuments().exec();
    return response({
      message: 'Users fetched successfully',
      data: {
        data: users,
        pagnation: {
          totalItems: totalUsers,
          currentPage,
          pageSize,
          totalPages: Math.ceil(totalUsers / pageSize),
          hasNextPage: currentPage * pageSize < totalUsers,
          hasPrevPage: currentPage > 1,
        },
      },
      statusCode: 200,
    });
  }

  public async validGoogleUser({
    email,
    fullName,
  }: {
    email: string;
    fullName: string;
  }) {
    // check if user already exists by email
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) return existingUser;

    // clean and normalize name
    let baseName = fullName?.replace(/\s+/g, '').toLowerCase();

    // if name somehow empty, use part of email
    if (!baseName || baseName.length < 3) {
      baseName = email.split('@')[0];
    }

    let uniqueName = baseName;
    let isTaken = await this.userModel.findOne({ fullName: uniqueName });

    while (isTaken) {
      const randomSuffix = Math.floor(Math.random() * 9000 + 1000);
      uniqueName = `${baseName}_${randomSuffix}`;
      isTaken = await this.userModel.findOne({ fullName: uniqueName });
    }

    const newUser = await this.userModel.create({
      fullName: uniqueName,
      email,
      role: 'student',
      provider: 'google',
    });

    return newUser;
  }

  /**
   * Generate JWT token for authenticated user.
   */
  public async refreshTokens(
    userId: string,
    refreshToken: string,
    res: Response,
  ) {
    const user = await this.userModel.findById(userId);
    if (!user || !user.hashedRefreshToken)
      throw new ForbiddenException('Access Denied');

    const refreshTokenMatches = await bcrypt.compare(
      refreshToken,
      user.hashedRefreshToken,
    );
    if (!refreshTokenMatches) throw new ForbiddenException('Access Denied');

    const tokens = await this.getTokens(
      user._id.toString(),
      user.role,
      user.email,
      user.fullName,
    );
    await this.updateRefreshToken(user._id.toString(), tokens.refreshToken);
    this.setCookies(res, tokens.accessToken, tokens.refreshToken);

    return response({
      message: 'تم تحديث الجلسة بنجاح ✅',
      statusCode: 200,
    });
  }

  public async logout(res: Response) {
    // Find the user associated with the request (if you have the user ID available in the context)
    // and nullify the refresh token. Since we don't pass userID to logout here often,
    // we might just clear cookies. Ideally, we should also clear the DB hash.
    // But for now, following the existing pattern of just clearing cookies in the response
    // We should update the controller to pass the user ID if we want to clear from DB too.
    // I will update this method to accept userId in the next step.
    this.removeCookies(res);
    return response({
      message: 'تم تسجيل الخروج بنجاح ✅',
      statusCode: 200,
    });
  }

  public async logoutUser(userId: string, res: Response) {
    if (userId) {
      await this.userModel.findByIdAndUpdate(userId, {
        hashedRefreshToken: null,
      });
    }
    this.removeCookies(res);
    return response({
      message: 'تم تسجيل الخروج بنجاح ✅',
      statusCode: 200,
    });
  }

  async updateRefreshToken(userId: string, refreshToken: string) {
    const hash = await this.hashPassword(refreshToken);
    await this.userModel.findByIdAndUpdate(userId, {
      hashedRefreshToken: hash,
    });
  }

  async getTokens(
    userId: string,
    role: string,
    email: string,
    fullName: string,
  ) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          id: userId,
          role,
          email,
          fullName,
        },
        {
          secret: this.config.get<string>('JWT_SECRET'),
          expiresIn: this.config.get('JWT_EXPIRES_IN') || '1d',
        },
      ),
      this.jwtService.signAsync(
        {
          id: userId,
          role,
          email,
          fullName,
        },
        {
          secret: this.config.get<string>('JWT_REFRESH_SECRET'),
          expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN') || '7d',
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  private setCookies(res: Response, accessToken: string, refreshToken: string) {
    res.cookie(COOKIE_NAME, accessToken, {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
      maxAge: 1000 * 60 * 60 * 7, // 7 hours
    });

    res.cookie(REFRESH_COOKIE_NAME, refreshToken, {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    });
  }

  private removeCookies(res: Response) {
    res.clearCookie(COOKIE_NAME, {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
      maxAge: 1000 * 60 * 60 * 7,
    });

    res.clearCookie(REFRESH_COOKIE_NAME, {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });
  }
  private generateJwtToken(payload: JwtPayload): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.config.get<string>('JWT_SECRET'),
      expiresIn: this.config.get('JWT_EXPIRES_IN') || '1d',
    });
  }

  private verifyToken(token: string): Promise<JwtPayload> {
    return this.jwtService.verifyAsync(token, {
      secret: this.config.get<string>('JWT_SECRET'),
    });
  }

  private async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }
}
