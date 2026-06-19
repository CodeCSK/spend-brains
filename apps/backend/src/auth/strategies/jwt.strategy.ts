import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { RootConfig } from '../../config';
import type { JwtPayload } from '../types/jwt-payload';
import type { RequestUser } from '../types/request-user';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService<RootConfig, true>) {
    const jwt = configService.get('jwt', { infer: true });
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwt.accessSecret,
    });
  }

  validate(payload: JwtPayload): RequestUser {
    if (payload.type !== 'access' || !payload.sub) {
      throw new UnauthorizedException();
    }
    return { id: payload.sub };
  }
}
