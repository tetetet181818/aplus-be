import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { UserSchema } from '../schemas/users.schema';
import { MailModule } from '../mail/mail.module';
import { NoteSchema } from '../schemas/note.schema';
import { NotificationModule } from '../notification/notification.module';
import { GoogleStrategy } from '../strategies/google.strategy';
import googleOauthConfig from '../config/google-oauth.config';

import { RefreshTokenStrategy } from '../strategies/refresh-token.strategy';

@Module({
  controllers: [AuthController],
  providers: [AuthService, GoogleStrategy, RefreshTokenStrategy],
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'Note', schema: NoteSchema },
    ]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          global: true,
          secret: configService.get<string>('JWT_SECRET'),
          signOptions: {
            expiresIn: configService.get<string>('JWT_EXPIRES_IN'),
          },
        };
      },
    }),
    ConfigModule.forFeature(googleOauthConfig),
    MailModule,
    NotificationModule,
  ],
})
export class AuthModule {}
