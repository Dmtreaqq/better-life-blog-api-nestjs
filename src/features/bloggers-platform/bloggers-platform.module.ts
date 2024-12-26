import { Module } from '@nestjs/common';
import { BlogsController } from './api/blogs.controller';
import { BlogsService } from './application/blogs.service';
import { BlogsRepository } from './repositories/blogs.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { BlogSchema } from './domain/blog.entity';
import { BlogsQueryRepository } from './repositories/query/blogs.query-repository';
import { PostsQueryRepository } from './repositories/query/posts.query-repository';
import { PostsController } from './api/posts.controller';
import { Post, PostSchema } from './domain/post.entity';
import { PostsRepository } from './repositories/posts.repository';
import { PostsService } from './application/posts.service';
import { CommentsQueryRepository } from './repositories/query/comments.query-repository';
import { Comment, CommentSchema } from './domain/comment.entity';
import { CommentsRepository } from './repositories/comments.repository';
import { CreateCommentUseCase } from './application/usecases/create-comment.usecase';
import { UserPlatformModule } from '../user-platform/user-platform.module';
import { CommentsController } from './api/comments.controller';

@Module({
  imports: [
    UserPlatformModule,
    MongooseModule.forFeature([
      { name: 'Blog', schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
      { name: Comment.name, schema: CommentSchema },
    ]),
  ],
  controllers: [BlogsController, PostsController, CommentsController],
  providers: [
    BlogsService,
    BlogsRepository,
    BlogsQueryRepository,
    PostsService,
    PostsQueryRepository,
    PostsRepository,
    CommentsQueryRepository,
    CommentsRepository,
    CreateCommentUseCase,
  ],
  exports: [MongooseModule],
})
export class BloggersPlatformModule {}
