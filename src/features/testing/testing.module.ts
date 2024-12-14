import { Module } from '@nestjs/common';
import { TestingController } from './testing.controller';
import { BloggersPlatformModule } from '../bloggers-platform/bloggers-platform.module';
import { UserPlatformModule } from '../user-platform/user-platform.module';

@Module({
  imports: [BloggersPlatformModule, UserPlatformModule],
  controllers: [TestingController],
})
export class TestingModule {}
