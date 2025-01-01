import { configDynamicModule } from './config-dynamic-module';
import { DynamicModule, Module } from '@nestjs/common';
import { BloggersPlatformModule } from './features/bloggers-platform/bloggers-platform.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { TestingModule } from './features/testing/testing.module';
import { UserPlatformModule } from './features/user-platform/user-platform.module';
import { CommonModule } from './common/common.module';
import { CommonConfig, Environments } from './common/common.config';
import { MongoMemoryServer } from 'mongodb-memory-server';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: async (commonConfig: CommonConfig) => {
        let mongoUri = commonConfig.mongoUri;
        if (commonConfig.env === Environments.Testing) {
          const mongoServer = await MongoMemoryServer.create();
          mongoUri = mongoServer.getUri();
        }

        return {
          uri: mongoUri,
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
    UserPlatformModule,
    BloggersPlatformModule,
    CommonModule,
    configDynamicModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  static async forRoot(commonConfig: CommonConfig): Promise<DynamicModule> {
    const additionalModules: any[] = [];

    if (commonConfig.includeTestingModule) {
      console.log('Testing Module Included');
      additionalModules.push(TestingModule);
    }

    return {
      module: AppModule,
      imports: additionalModules,
    };
  }
}
