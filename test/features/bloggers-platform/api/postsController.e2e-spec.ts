import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { ObjectId } from 'mongodb';
import { BloggersPlatformModule } from '../../../../src/features/bloggers-platform/bloggers-platform.module';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongooseModule } from '@nestjs/mongoose';
import { API_PATH } from '../../../../src/common/config';
import { CreateBlogInput } from '../../../../src/features/bloggers-platform/api/input-dto/create-blog.dto';
import { CreatePostInputDto } from '../../../../src/features/bloggers-platform/api/input-dto/create-post-input.dto';
import { BlogViewDto } from '../../../../src/features/bloggers-platform/api/view-dto/blog.view-dto';
import { TestingModule as TestModule } from '../../../../src/features/testing/testing.module';
import { PostViewDto } from '../../../../src/features/bloggers-platform/api/view-dto/post.view-dto';
import { ReactionStatus } from '../../../../src/features/bloggers-platform/api/enums/ReactionStatus';
import { API_PREFIX } from '../../../../src/settings/global-prefix.setup';
import { appSetup } from '../../../../src/settings/app.setup';

const blogInput: CreateBlogInput = {
  name: 'Somebody Who',
  description: 'Some description' + Math.floor(Math.random() * 5 + 1),
  websiteUrl: 'https://somewebsite.com',
};

const postInput: CreatePostInputDto = {
  title: 'Post Title',
  content: 'Post Content',
  shortDescription: 'Post Description',
  blogId: 'Will be generated',
};

describe('Posts Positive (e2e)', () => {
  let app: INestApplication;
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TestModule,
        BloggersPlatformModule,
        MongooseModule.forRoot(mongoUri),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    appSetup(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await request(app.getHttpServer()).delete(
      API_PREFIX + API_PATH.TEST_DELETE,
    );
  });

  it('should POST a post successfully', async () => {
    // CREATE BLOG
    const createdBlogResponse = await request(app.getHttpServer())
      .post(API_PREFIX + API_PATH.BLOGS)
      .send(blogInput)
      // .set('authorization', authHeader)
      .expect(HttpStatus.CREATED);
    const createdBlog: BlogViewDto = createdBlogResponse.body;

    // CREATE POST
    const createdPostResponse = await request(app.getHttpServer())
      .post(API_PREFIX + API_PATH.POSTS)
      .send({ ...postInput, blogId: createdBlog.id })
      // .set('authorization', authHeader)
      .expect(HttpStatus.CREATED);

    expect(createdPostResponse.body).toEqual({
      ...postInput,
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: ReactionStatus.None,
        newestLikes: [],
      },
      blogName: createdBlog.name,
      blogId: createdBlog.id,
      id: expect.any(String),
      createdAt: expect.any(String),
    });
  });

  it('should return 400 when try to create post for not existing blog', async () => {
    // CREATE POST
    const randomObjectId = new ObjectId();

    await request(app.getHttpServer())
      .post(API_PREFIX + API_PATH.POSTS)
      .send({ ...postInput, blogId: randomObjectId })
      // .set('authorization', authHeader)
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('Should - get empty array when no posts created', async () => {
    return request(app.getHttpServer())
      .get(API_PREFIX + API_PATH.POSTS)
      .expect(HttpStatus.OK)
      .then((response) => {
        expect(response.body).toEqual({
          items: [],
          page: 1,
          pageSize: 10,
          pagesCount: 1,
          totalCount: 0,
        });
      });
  });

  it('should DELETE post successfully', async () => {
    const createdBlogResponse = await request(app.getHttpServer())
      .post(API_PREFIX + API_PATH.BLOGS)
      .send(blogInput)
      // .set('authorization', authHeader)
      .expect(HttpStatus.CREATED);
    const createdBlog: BlogViewDto = createdBlogResponse.body;

    // CREATE POST
    const createdPostResponse = await request(app.getHttpServer())
      .post(API_PREFIX + API_PATH.POSTS)
      .send({ ...postInput, blogId: createdBlog.id })
      // .set('authorization', authHeader)
      .expect(HttpStatus.CREATED);

    const createdPost: PostViewDto = createdPostResponse.body;

    await request(app.getHttpServer())
      .delete(`${API_PREFIX + API_PATH.POSTS}/${createdPost.id}`)
      // .set('authorization', authHeader)
      .expect(HttpStatus.NO_CONTENT);

    await request(app.getHttpServer())
      .get(`${API_PREFIX + API_PATH.POSTS}/${createdPost.id}`)
      .expect(HttpStatus.NOT_FOUND);
  });
});
