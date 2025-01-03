import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Comment,
  CommentDocument,
  CommentModelType,
} from '../domain/comment.entity';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
  ) {}

  async save(comment: CommentDocument) {
    await comment.save();
  }

  async getById(id: string) {
    return this.CommentModel.findById(id);
  }

  async deleteComment(comment: CommentDocument) {
    const result = await comment.deleteOne();

    if (result.deletedCount !== 1) {
      throw new BadRequestException([
        {
          message: 'Entity was not deleted for some reason',
          field: 'id',
        },
      ]);
    }
  }

  async getByIdOrThrow(id: string) {
    const comment = await this.CommentModel.findById(id);

    if (!comment) {
      throw new NotFoundException([
        {
          message: 'Comment not found',
          field: 'id',
        },
      ]);
    }

    return comment;
  }
}
