import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BlogDocument, BlogModelType } from '../domain/blog.entity';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class BlogsRepository {
  constructor(@InjectModel('Blog') private BlogModel: BlogModelType) {}

  async save(blog: BlogDocument) {
    await blog.save();
  }

  async getByIdOrThrow(id: string): Promise<BlogDocument> {
    const blog = await this.BlogModel.findById(id);

    if (!blog) {
      throw new NotFoundException({
        errorsMessages: [
          {
            message: 'Blog not found',
            field: 'id',
          },
        ],
      });
    }

    return blog;
  }

  async delete(blog: BlogDocument): Promise<void> {
    const result = await blog.deleteOne();

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
