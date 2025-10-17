import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  Delete,
  Put,
  UseGuards,
  Param,
  Req,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { ForgetPasswordDto } from './dtos/forget-password.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { AuthGuard } from './guards/auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import type { JwtPayload } from '../utils/types';
import type { GoogleAuthRequest } from '../utils/types';
import { GoogleAuthGuard } from '../guards/google-auth.guard';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';

@Controller('/api/v1/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Get('/check-auth')
  @UseGuards(AuthGuard)
  public getCurrentUser(@CurrentUser() payload: JwtPayload) {
    return this.authService.getCurrentUser(payload.id || '');
  }

  @Post('/register')
  public register(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }

  @Post('/login')
  @HttpCode(200)
  public login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.login(body, res);
  }

  @Get('/verify')
  public verify(
    @Query('token') token: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.verify(token, res);
  }

  @Post('/logout')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  public logout(@Res({ passthrough: true }) res: Response) {
    return this.authService.logout(res);
  }

  @Post('/forget-password')
  public forgetPassword(@Body() body: ForgetPasswordDto) {
    return this.authService.forgetPassword(body.email);
  }

  @Post('/reset-password')
  public resetPassword(@Body() body: ResetPasswordDto) {
    return this.authService.resetPassword(body);
  }

  @Delete('/delete-account')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  public deleteAccount(@CurrentUser() payload: JwtPayload) {
    return this.authService.deleteAccount(payload.id || '');
  }

  @Put('/update-user')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  public updateUser(
    @CurrentUser() payload: JwtPayload,
    @Body() body: UpdateUserDto,
  ) {
    if (!payload.id) return;
    return this.authService.updateUser(payload.id, body);
  }

  @Get('/all-users')
  @UseGuards(AuthGuard)
  public getAllUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('fullName') fullName?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.authService.getAllUsers(pageNum, limitNum, fullName || '');
  }

  @Get('/:id')
  @UseGuards(AuthGuard)
  public getUserById(@Param('id') id: string) {
    return this.authService.getUserById(id);
  }

  @Get('/google/login')
  @UseGuards(GoogleAuthGuard)
  async googleAuth() {}

  @Get('/google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthCallback(
    @Req() req: GoogleAuthRequest,
    @Res() res: Response,
  ) {
    const resLogin = await this.authService.googleLogin(req);
    if (typeof resLogin === 'object' && 'token' in resLogin) {
      res.cookie('access_token', resLogin.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none',
        maxAge: 1000 * 60 * 60 * 24 * 7,
      });

      if (typeof res === 'object' && resLogin.token) {
        res.redirect(
          `${this.config.get<string>('FRONTEND_SERVER_PRODUCTION')}/google-callback?token=${resLogin?.token}`,
        );
      }
      return resLogin;
    }
  }
}
