import type { JwtPayload } from '@base-saas/shared';
import { createParamDecorator, type ExecutionContext } from '@nestjs/common';

export const ExtractJwtPayload = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtPayload => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as JwtPayload;
  },
);
