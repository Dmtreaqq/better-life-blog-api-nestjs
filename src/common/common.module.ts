import { Global, Module } from '@nestjs/common';
import { JwtStrategy } from './guards/jwt.strategy';

@Global()
@Module({
  providers: [JwtStrategy],
})
export class CommonModule {}
