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
  async canActivate(context: ExecutionContext) {
    const request: Request = context.switchToHttp().getRequest();
    if (!request.headers.authorization) {
      throw new UnauthorizedException('access denied , invalid token');
    }

    const [type, token] = request.headers.authorization.split(' ') ?? [];
    if (type === 'Bearer' && token) {
      try {
        const payload: JwtPayload = await this.jwtService.verifyAsync(token, {
          secret: this.config.get('JWT_SECRET'),
        });
        request[CURRENT_USER_KEY] = payload;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        throw new UnauthorizedException('access denied , invalid token');
      }
    } else {
      throw new UnauthorizedException('access denied , invalid token');
    }
    return true;
  }
}
