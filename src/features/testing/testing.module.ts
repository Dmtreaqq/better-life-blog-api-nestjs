import { Module } from '@nestjs/common';
import { TestingController } from './testing.controller';
import { BloggersPlatformModule } from '../bloggers-platform/bloggers-platform.module';

@Module({
  imports: [BloggersPlatformModule],
  controllers: [TestingController],
})
export class TestingModule {}
