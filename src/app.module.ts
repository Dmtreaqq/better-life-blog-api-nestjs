import { Module } from '@nestjs/common';
import { BloggersPlatformModule } from './features/bloggers-platform/bloggers-platform.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { TestingModule } from './features/testing/testing.module';
import { UserPlatformModule } from './features/user-platform/user-platform.module';

@Module({
  imports: [
    // mongodb://localhost:27017/?retryWrites=true
    // mongodb+srv://${String(process.env.MONGO_USERNAME)}:${String(process.env.MONGO_PASSWORD)}@cluster0.klsta.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
    MongooseModule.forRoot(`mongodb://localhost:27017/?retryWrites=true`, {
      dbName: 'better-life-blog-nest',
      onConnectionCreate: (connection: Connection) => {
        connection.on('connected', () =>
          console.log('Successfully connected to MongoDB'),
        );
      },
    }),
    TestingModule,
    UserPlatformModule,
    BloggersPlatformModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
