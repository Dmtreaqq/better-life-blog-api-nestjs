import {
  CanActivate,
  ExecutionContext,
  Inject,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { CommonConfig } from '../common.config';

export const fromUTF8ToBase64 = (code: string) => {
  const buff2 = Buffer.from(code, 'utf8');
  return buff2.toString('base64');
};

export class BasicAuthGuard implements CanActivate {
  // TODO: спросить про Inject
  constructor(@Inject(CommonConfig) private commonConfig: CommonConfig) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    const authHeader = request.headers['authorization'];

    if (!authHeader || authHeader.split(' ')[0] !== 'Basic') {
      throw new UnauthorizedException();
    }

    const codedAuth = fromUTF8ToBase64(this.commonConfig.basicLogin);

    if (authHeader.slice(6) !== codedAuth) {
      throw new UnauthorizedException();
    }

    return true;
  }
}
