import { Module } from '@nestjs/common';
import { TestingController } from './testing.controller';
import { BloggersPlatformModule } from '../bloggers-platform/bloggers-platform.module';
import { UserPlatformModule } from '../user-platform/user-platform.module';
import { CommunicationModule } from '../communication/communication.module';
import { CommonModule } from '../../common/common.module';

@Module({
  imports: [
    CommonModule,
    BloggersPlatformModule,
    UserPlatformModule,
    CommunicationModule,
  ],
  controllers: [TestingController],
})
export class TestingModule {}
