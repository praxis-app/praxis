import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';

export interface AccessTokenPayload {
  /**
   * Identifies the user or subject of the JWT
   * https://datatracker.ietf.org/doc/html/rfc7519#section-4.1.2
   */
  sub: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private usersService: UsersService,
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: JwtStrategy.extractJWT,
      secretOrKey: configService.get('JWT_KEY'),
      ignoreExpiration: false,
    });
  }

  async validate({ sub }: AccessTokenPayload) {
    return this.usersService.getUser({ id: sub });
  }

  private static extractJWT(req: Request): string | null {
    if (req.cookies && 'auth' in req.cookies) {
      return req.cookies.auth.access_token;
    }
    return null;
  }
}
