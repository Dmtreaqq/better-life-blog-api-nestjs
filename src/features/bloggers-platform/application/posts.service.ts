import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePostInputDto } from '../api/input-dto/create-post-input.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostModelType } from '../domain/post.entity';
import { PostsRepository } from '../repositories/posts.repository';
import { BlogsRepository } from '../repositories/blogs.repository';
import { UpdatePostInputDto } from '../api/input-dto/update-post-input.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private PostModel: PostModelType,
    private postsRepository: PostsRepository,
    private blogsRepository: BlogsRepository,
  ) {}

  async createPost(dto: CreatePostInputDto): Promise<string> {
    const blog = await this.blogsRepository.getById(dto.blogId);
    if (!blog) {
      throw new BadRequestException([
        {
          message: 'Blog not found',
          field: 'blogId',
        },
      ]);
    }

    const post = this.PostModel.createInstance({
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId: blog.id,
      blogName: blog.name,
    });

    await this.postsRepository.save(post);

    return post.id;
  }

  async createPostForBlog(
    dto: Omit<CreatePostInputDto, 'blogId'>,
    blogId: string,
  ): Promise<string> {
    const blog = await this.blogsRepository.getById(blogId);
    if (!blog) {
      throw new BadRequestException([
        {
          message: 'Blog not found',
          field: 'blogId',
        },
      ]);
    }

    const post = this.PostModel.createInstance({
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId: blog.id,
      blogName: blog.name,
    });

    await this.postsRepository.save(post);

    return post.id;
  }

  async editPost(id: string, dto: UpdatePostInputDto) {
    const post = await this.postsRepository.getByIdOrThrow(id);

    post.title = dto.title;
    post.shortDescription = dto.shortDescription;
    post.content = dto.content;
    post.blogId = dto.blogId;

    await this.postsRepository.save(post);
  }

  async deletePost(id: string): Promise<void> {
    const post = await this.postsRepository.getByIdOrThrow(id);

    await this.postsRepository.delete(post);
  }
}
