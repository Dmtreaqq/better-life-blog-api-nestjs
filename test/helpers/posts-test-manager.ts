import { HttpStatus, INestApplication } from '@nestjs/common';

import * as request from 'supertest';
import { API_PREFIX } from '../../src/settings/global-prefix.setup';
// import { delay } from './delay';
import { CreatePostInputDto } from '../../src/features/bloggers-platform/api/input-dto/create-post-input.dto';
import { API_PATH } from '../../src/common/constants';
import { PostViewDto } from '../../src/features/bloggers-platform/api/view-dto/post.view-dto';
import { delay } from './delay';

export class PostsTestManager {
  constructor(private app: INestApplication) {}
  async createPost(
    createModel: CreatePostInputDto,
    statusCode: number = HttpStatus.CREATED,
  ): Promise<PostViewDto> {
    const response = await request(this.app.getHttpServer())
      .post(`${API_PREFIX}${API_PATH.POSTS}`)
      .send(createModel)
      .expect(statusCode);

    return response.body;
  }

  async createPosts(blogId: string, count: number) {
    const postsPromises = [] as Promise<PostViewDto>[];

    for (let i = 0; i < count; ++i) {
      await delay(50);
      const response = this.createPost({
        blogId,
        title: `postTitle` + i,
        shortDescription: `post${i}description`,
        content: `cnt${i}`,
      });
      postsPromises.push(response);
    }

    return Promise.all(postsPromises);
  }
}
