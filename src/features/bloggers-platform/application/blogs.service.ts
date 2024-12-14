import { Injectable } from '@nestjs/common';
import { CreateBlogInput } from '../api/input-dto/create-blog.dto';
import { UpdateBlogInput } from '../api/input-dto/update-blog.dto';
import { BlogsRepository } from '../repositories/blogs.repository';
import { InjectModel } from '@nestjs/mongoose';
import { BlogModelType } from '../domain/blog.entity';

@Injectable()
export class BlogsService {
  constructor(
    @InjectModel('Blog') private BlogModel: BlogModelType,
    private blogsRepository: BlogsRepository,
  ) {}

  async createBlog(dto: CreateBlogInput): Promise<string> {
    const blog = this.BlogModel.createInstance({
      name: dto.name,
      description: dto.description,
      websiteUrl: dto.websiteUrl,
    });

    await this.blogsRepository.save(blog);

    return blog.id;
  }

  async editBlog(id: string, dto: UpdateBlogInput) {
    const blog = await this.blogsRepository.getByIdOrThrow(id);

    blog.name = dto.name;
    blog.description = dto.description;
    blog.websiteUrl = dto.websiteUrl;

    await this.blogsRepository.save(blog);
  }

  async deleteBlog(id: string): Promise<void> {
    const blog = await this.blogsRepository.getByIdOrThrow(id);

    await this.blogsRepository.delete(blog);
  }
}
