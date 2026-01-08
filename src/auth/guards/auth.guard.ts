import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { JwtPayload } from '../../utils/types';
import { CURRENT_USER_KEY } from '../../utils/constants';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  /**
   * Checks and verifies JWT from header or cookie.
   * Works with raw tokens (no "Bearer" prefix).
   * @param context - Execution context.
   * @returns {Promise<boolean>} True if token is valid.
   * @throws {UnauthorizedException} If token missing or invalid.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const token = request.cookies?.token?.trim();

    if (!token) {
      throw new UnauthorizedException('Access denied: missing token');
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const payload: JwtPayload = await this.jwtService.verifyAsync(token, {
        secret: this.config.get<string>('auth.jwtSecret'),
      });

      request[CURRENT_USER_KEY] = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Access denied: invalid token');
    }
  }
}
