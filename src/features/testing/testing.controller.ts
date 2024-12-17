import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { BlogModelType } from '../bloggers-platform/domain/blog.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostModelType } from '../bloggers-platform/domain/post.entity';
import { User, UserModelType } from '../user-platform/domain/user.entity';

@Controller('testing')
export class TestingController {
  constructor(
    @InjectModel('Blog')
    private BlogModel: BlogModelType,
    @InjectModel(Post.name)
    private PostModel: PostModelType,
    @InjectModel(User.name)
    private UserModel: UserModelType,
  ) {}

  @Delete('all-data')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAll() {
    await this.BlogModel.deleteMany({});
    await this.PostModel.deleteMany({});
    await this.UserModel.deleteMany({});
  }
}
