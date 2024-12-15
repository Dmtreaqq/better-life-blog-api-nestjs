import { HttpStatus, INestApplication } from '@nestjs/common';

import * as request from 'supertest';
import { CreateBlogInput } from '../../src/features/bloggers-platform/api/input-dto/create-blog.dto';
import { API_PREFIX } from '../../src/settings/global-prefix.setup';
import { BlogViewDto } from '../../src/features/bloggers-platform/api/view-dto/blog.view-dto';

export class BlogsTestManager {
  constructor(private app: INestApplication) {}
  async createBlog(
    createModel: CreateBlogInput,
    statusCode: number = HttpStatus.CREATED,
  ): Promise<BlogViewDto> {
    const response = await request(this.app.getHttpServer())
      .post(`${API_PREFIX}/blogs`)
      .send(createModel)
      .expect(statusCode);

    return response.body;
  }
}
