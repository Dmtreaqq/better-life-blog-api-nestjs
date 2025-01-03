import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { BlogModelType } from '../bloggers-platform/domain/blog.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostModelType } from '../bloggers-platform/domain/post.entity';
import { User, UserModelType } from '../user-platform/domain/user.entity';
import {
  Comment,
  CommentModelType,
} from '../bloggers-platform/domain/comment.entity';
import {
  UserDeviceSession,
  UserDeviceSessionModelType,
} from '../user-platform/domain/user-device-session.entity';
import {
  Reaction,
  ReactionModelType,
} from '../bloggers-platform/domain/reaction.entity';

@Controller('testing')
export class TestingController {
  constructor(
    @InjectModel('Blog')
    private BlogModel: BlogModelType,
    @InjectModel(Post.name)
    private PostModel: PostModelType,
    @InjectModel(User.name)
    private UserModel: UserModelType,
    @InjectModel(Comment.name)
    private CommentModel: CommentModelType,
    @InjectModel(UserDeviceSession.name)
    private UserDeviceSessionModel: UserDeviceSessionModelType,
    @InjectModel(Reaction.name)
    private ReactionModel: ReactionModelType,
  ) {}

  @Delete('all-data')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAll() {
    await this.BlogModel.deleteMany({});
    await this.PostModel.deleteMany({});
    await this.UserModel.deleteMany({});
    await this.CommentModel.deleteMany({});
    await this.UserDeviceSessionModel.deleteMany({});
    await this.ReactionModel.deleteMany({});
  }
}
