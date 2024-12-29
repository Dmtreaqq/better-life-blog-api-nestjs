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

  async getById(id: string): Promise<BlogDocument | null> {
    return this.BlogModel.findById(id);
  }

  async getByIdOrThrow(id: string): Promise<BlogDocument> {
    const blog = await this.BlogModel.findById(id);

    if (!blog) {
      throw new NotFoundException([
        {
          message: 'Blog not found',
          field: 'id',
        },
      ]);
    }

    return blog;
  }

  async delete(blog: BlogDocument): Promise<void> {
    const result = await blog.deleteOne();

    if (result.deletedCount !== 1) {
      throw new BadRequestException([
        {
          message: 'Entity was not deleted for some reason',
          field: 'id',
        },
      ]);
    }
  }

  async blogIsExist(id: string): Promise<boolean> {
    const blog = await this.BlogModel.findById(id);

    if (!blog) return false;

    return true;
  }
}
