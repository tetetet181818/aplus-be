import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable } from '@nestjs/common';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';
import { AuthService } from '../auth/auth.service';
import googleOauthConfig from '../config/google-oauth.config';
import type { ConfigType } from '@nestjs/config';

export interface GoogleUser {
  email: string;
  firstName: string;
  lastName: string;
  picture: string;
  accessToken: string;
  roles?: string[];
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(googleOauthConfig.KEY)
    private googleConfig: ConfigType<typeof googleOauthConfig>,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: googleConfig.clientID as string,
      clientSecret: googleConfig.clientSecret as string,
      callbackURL: googleConfig.callbackURL as string,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ) {
    const user = await this.authService.validGoogleUser({
      email: profile?.emails?.[0]?.value || '',
      fullName: profile?.displayName || '',
    });
    done(null, user);
  }
}
