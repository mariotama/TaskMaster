import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { JwtPayload } from 'src/shared/interfaces/user.interface';

/**
 * JWT authentication strategy
 * Verify and validate JWT tokens in petitions
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'secret',
    });
  }

  /**
   * Validates payload of JWT token
   * @param payload token data decrypted
   * @returns validated user
   * @throws UnauthorizedExpression if user doesn't exist
   */
  async validate(payload: JwtPayload) {
    try {
      const user = await this.authService.validateUser(payload);

      if (!user) {
        throw new UnauthorizedException('User not valid or token expired');
      }

      return user;
    } catch (error) {
      throw new UnauthorizedException('Auth error' + error);
    }
  }
}
