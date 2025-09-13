import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from '../../utils/types';
import { CURRENT_USER_KEY } from '../../utils/constants';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): JwtPayload | undefined => {
    const request = context
      .switchToHttp()
      .getRequest<{ [CURRENT_USER_KEY]?: JwtPayload }>();
    const payload = request[CURRENT_USER_KEY];
    return payload;
  },
);
