import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../../user/entities/user.entity';

// Extends the Request interface to include the ''user'' propierty
interface RequestWithUser extends Request {
  user: User;
}
/**
 * Decorator to obtain the actual user
 * Used in controllers to access current authenticated user
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): User => {
    // Obtain context petition
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();

    // Return user
    return request.user;
  },
);
