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
import { DeleteCommentUseCase } from './application/usecases/delete-comment.usecase';
import { UpdateCommentUseCase } from './application/usecases/update-comment.usecase';
import { Reaction, ReactionSchema } from './domain/reaction.entity';
import { UpdateReactionUseCase } from './application/usecases/update-reaction.usecase';
import { BlogIsExistConstraint } from './validation/blog-is-exist.decorator';

const useCases = [
  CreateCommentUseCase,
  DeleteCommentUseCase,
  UpdateCommentUseCase,
  UpdateReactionUseCase,
];

@Module({
  imports: [
    UserPlatformModule,
    MongooseModule.forFeature([
      { name: 'Blog', schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: Reaction.name, schema: ReactionSchema },
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
    BlogIsExistConstraint,
    ...useCases,
  ],
  exports: [MongooseModule],
})
export class BloggersPlatformModule {}
