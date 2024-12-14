import { Module } from '@nestjs/common';
import { BloggersPlatformModule } from './features/bloggers-platform/bloggers-platform.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/?retryWrites=true', {
      dbName: 'better-life-blog-nest',
      onConnectionCreate: (connection: Connection) => {
        connection.on('connected', () =>
          console.log('Successfully connected to MongoDB'),
        );
      },
    }),
    BloggersPlatformModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
