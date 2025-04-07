import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

/**
 * Guard to protect routes that require JWT auth
 * Verifies that token is valid and its there
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  /**
   * Verifies if petition can activate handler
   * @param context execution context
   * @returns true if auth, false if not
   */
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Verifies if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    // If public, enable access
    if (isPublic) {
      return true;
    }

    // Verify JWT Token
    return super.canActivate(context);
  }

  /**
   * Handles auth errors
   * @param err error ocurred
   * @returns never returns, throws exception
   */
  handleRequest(err: any, user: any): any {
    // If error or not user, UnauthorizedException
    if (err || !user) {
      throw (
        err ||
        new UnauthorizedException(
          'You are not authenticated or your token is expired',
        )
      );
    }

    // Return if everything is correct
    return user;
  }
}
