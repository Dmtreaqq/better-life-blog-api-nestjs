import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Injectable } from '@nestjs/common';
import { UserContext } from '../dto/user-context.dto';
import { CommonConfig } from '../common.config';
import { Request } from 'express';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(commonConfig: CommonConfig) {
    super({
      jwtFromRequest: JwtRefreshStrategy.ExtractJwtFromCookie,
      ignoreExpiration: false,
      secretOrKey: commonConfig.refreshTokenSecret,
    });
  }

  private static ExtractJwtFromCookie(req: Request): string | null {
    if (req && req.cookies) {
      return req.cookies.refreshToken || null;
    }
    return null;
  }

  async validate(payload: UserContext) {
    return payload;
  }
}
