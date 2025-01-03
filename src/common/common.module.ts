import { Global, Module } from '@nestjs/common';
import { JwtStrategy } from './guards/jwt.strategy';
import { CommonConfig } from './common.config';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtRefreshStrategy } from './guards/jwt-refresh.strategy';

@Global()
@Module({
  imports: [CqrsModule],
  providers: [JwtStrategy, CommonConfig, JwtRefreshStrategy],
  exports: [CommonConfig, CqrsModule],
})
export class CommonModule {}
