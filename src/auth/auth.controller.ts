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

@Controller('/api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('/check-auth')
  @UseGuards(AuthGuard)
  public getCurrentUser(@CurrentUser() payload: JwtPayload) {
    return this.authService.getCurrentUser(payload.id);
  }

  @Post('/register')
  public register(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }

  @Post('/login')
  @HttpCode(200)
  public login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }

  @Get('/verify')
  public verify(@Query('token') token: string) {
    return this.authService.verify(token);
  }

  @Post('/forget-password')
  public forgetPassword(@Body() body: ForgetPasswordDto) {
    return this.authService.forgetPassword(body.email);
  }

  @Post('/reset-password')
  public resetPassword(@Body() body: ResetPasswordDto) {
    return this.authService.resetPassword(body);
  }

  @Post('/logout')
  @HttpCode(200)
  public logout(@Query('token') token: string) {
    return this.authService.logout(token);
  }

  @Delete('/delete-account')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  public deleteAccount(@CurrentUser() payload: JwtPayload) {
    return this.authService.deleteAccount(payload.id);
  }

  @Put('/update-user')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  public updateUser(
    @CurrentUser() payload: JwtPayload,
    @Body() body: UpdateUserDto,
  ) {
    return this.authService.updateUser(payload.id, body);
  }

  @Get('/:id')
  @UseGuards(AuthGuard)
  public getUserById(@Param('id') id: string) {
    return this.authService.getUserById(id);
  }
}
