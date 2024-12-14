import { Module } from '@nestjs/common';
import { BlogsController } from './api/blogsController';
import { BlogsService } from './application/blogs.service';
import { BlogsRepository } from './repositories/blogs.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { BlogSchema } from './domain/blog.entity';
import { BlogsQueryRepository } from './repositories/query/blogs.query-repository';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Blog', schema: BlogSchema }])],
  controllers: [BlogsController],
  providers: [BlogsService, BlogsRepository, BlogsQueryRepository],
  exports: [],
})
export class BloggersPlatformModule {}
