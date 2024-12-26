import { Global, Module } from '@nestjs/common';
import { JwtStrategy } from './guards/jwt.strategy';
import { CommonConfig } from './common.config';
import { CqrsModule } from '@nestjs/cqrs';

@Global()
@Module({
  imports: [CqrsModule],
  providers: [JwtStrategy, CommonConfig],
  exports: [CommonConfig, CqrsModule],
})
export class CommonModule {}
