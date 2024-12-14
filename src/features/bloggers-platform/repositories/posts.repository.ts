import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Post, PostDocument, PostModelType } from '../domain/post.entity';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class PostsRepository {
  constructor(@InjectModel(Post.name) private PostModel: PostModelType) {}

  async save(post: PostDocument) {
    await post.save();
  }

  async getByIdOrThrow(id: string): Promise<PostDocument> {
    const post = await this.PostModel.findById(id);

    if (!post) {
      throw new NotFoundException({
        errorsMessages: [
          {
            message: 'Post not found',
            field: 'id',
          },
        ],
      });
    }

    return post;
  }

  async delete(post: PostDocument): Promise<void> {
    const result = await post.deleteOne();

    if (result.deletedCount !== 1) {
      throw new BadRequestException({
        errorsMessages: [
          {
            message: 'Entity was not deleted for some reason',
            field: 'id',
          },
        ],
      });
    }
  }
}
