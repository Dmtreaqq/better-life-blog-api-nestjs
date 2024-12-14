import { Module } from '@nestjs/common';
import { BlogsController } from './api/blogsController';
import { BlogsService } from './application/blogs.service';
import { BlogsRepository } from './repositories/blogs.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { BlogSchema } from './domain/blog.entity';
import { BlogsQueryRepository } from './repositories/query/blogs.query-repository';
import { PostsQueryRepository } from './repositories/query/posts.query-repository';
import { PostsController } from './api/postsController';
import { Post, PostSchema } from './domain/post.entity';
import { PostsRepository } from './repositories/posts.repository';
import { PostsService } from './application/posts.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Blog', schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
    ]),
  ],
  controllers: [BlogsController, PostsController],
  providers: [
    BlogsService,
    BlogsRepository,
    BlogsQueryRepository,
    PostsService,
    PostsQueryRepository,
    PostsRepository,
  ],
  exports: [MongooseModule],
})
export class BloggersPlatformModule {}
