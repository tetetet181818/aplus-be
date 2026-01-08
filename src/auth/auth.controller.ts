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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiQuery,
} from '@nestjs/swagger';
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
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { ConfigService } from '@nestjs/config';
import type { Response, Request } from 'express';
import type { Express } from 'express';
import { ValidateObjectIdPipe } from '../pipes/validate-object-id.pipe';

@ApiTags('Auth')
@Controller('/api/v1/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Get('/check-auth')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check current authentication status' })
  @ApiResponse({ status: 200, description: 'Returns the current user data' })
  public getCurrentUser(@CurrentUser() payload: JwtPayload) {
    return this.authService.getCurrentUser(payload.id || '');
  }

  @Post('/register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  public register(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }

  @Post('/login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Login user and set cookies' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  public login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.login(body, res);
  }

  @Get('/verify')
  @ApiOperation({ summary: 'Verify email token' })
  @ApiQuery({ name: 'token', description: 'Verification token from email' })
  public verify(
    @Query('token') token: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.verify(token, res);
  }

  @Post('/refresh')
  @HttpCode(200)
  @UseGuards(RefreshTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  public refresh(
    @CurrentUser() payload: JwtPayload,
    @Req() req: Request & { user: JwtPayload & { refreshToken: string } },
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.user['refreshToken'];
    return this.authService.refreshTokens(payload.id || '', refreshToken, res);
  }

  @Post('/logout')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout user and clear cookies' })
  public logout(
    @Res({ passthrough: true }) res: Response,
    @CurrentUser() payload: JwtPayload,
  ) {
    return this.authService.logoutUser(payload.id || '', res);
  }

  @Post('/forget-password')
  @ApiOperation({ summary: 'Request password reset email' })
  public forgetPassword(@Body() body: ForgetPasswordDto) {
    return this.authService.forgetPassword(body);
  }

  @Post('/reset-password')
  @ApiOperation({ summary: 'Reset password using token' })
  public resetPassword(@Body() body: ResetPasswordDto) {
    return this.authService.resetPassword(body);
  }

  @Delete('/delete-account')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete user account' })
  public deleteAccount(@CurrentUser() payload: JwtPayload) {
    return this.authService.deleteAccount(payload.id || '');
  }

  @Put('/update-user')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user profile information' })
  public updateUser(
    @CurrentUser() payload: JwtPayload,
    @Body() body: UpdateUserDto,
  ) {
    if (!payload.id) return;
    return this.authService.updateUser(payload.id, body);
  }

  @Post('/avatar')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload or update user avatar' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  public updateAvatar(
    @CurrentUser() payload: JwtPayload,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!payload.id) return;
    return this.authService.updateAvatar(payload.id, file);
  }

  @Get('/best-sellers')
  @ApiOperation({ summary: 'Get a list of best selling users' })
  public getBestSellers() {
    return this.authService.getBestSellers();
  }

  @Get('/all-users')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users with pagination (Admin/Authorized)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'fullName', required: false, type: String })
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
  @ApiOperation({ summary: 'Get user profile by ID' })
  public getUserById(@Param('id', ValidateObjectIdPipe) id: string) {
    return this.authService.getUserById(id);
  }

  @Get('/google/login')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Initiate Google OAuth login' })
  async googleAuth() {}

  @Get('/google/callback')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Google OAuth callback handler' })
  async googleAuthCallback(
    @Req() req: GoogleAuthRequest,
    @Res() res: Response,
  ) {
    return await this.authService.googleLogin(req, res);
  }
}
