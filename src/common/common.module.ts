import { Global, Module } from '@nestjs/common';
import { JwtStrategy } from './guards/jwt.strategy';
import { CommonConfig } from './common.config';

@Global()
@Module({
  providers: [JwtStrategy, CommonConfig],
  exports: [CommonConfig],
})
export class CommonModule {}
