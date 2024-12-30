import { configDynamicModule } from './config-dynamic-module';
import { Module } from '@nestjs/common';
import { BloggersPlatformModule } from './features/bloggers-platform/bloggers-platform.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { TestingModule } from './features/testing/testing.module';
import { UserPlatformModule } from './features/user-platform/user-platform.module';
import { CommonModule } from './common/common.module';
import { CommonConfig } from './common/common.config';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: (commonConfig: CommonConfig) => {
        return {
          uri: commonConfig.mongoUri,
          dbName: 'better-life-blog-nest',
          onConnectionCreate: (connection: Connection) => {
            connection.on('connected', () =>
              console.log('Successfully connected to MongoDB'),
            );
          },
        };
      },
      inject: [CommonConfig],
    }),
    TestingModule,
    UserPlatformModule,
    BloggersPlatformModule,
    // CommonModule,
    configDynamicModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
