import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongooseModule } from '@nestjs/mongoose';
import { API_PATH } from '../../../../src/common/constants';
import { API_PREFIX } from '../../../../src/settings/global-prefix.setup';
import { appSetup } from '../../../../src/settings/app.setup';
import { BlogsTestManager } from '../../../helpers/blogs-test-manager';
import { UpdateBlogInput } from '../../../../src/features/bloggers-platform/api/input-dto/update-blog.dto';
import { CreatePostInputDto } from '../../../../src/features/bloggers-platform/api/input-dto/create-post-input.dto';
import { TestingModule as TestModule } from '../../../../src/features/testing/testing.module';
import { CommonConfig } from '../../../../src/common/common.config';
import { basicAuthHeader } from '../../../helpers/users-test-manager';
import { AppModule } from '../../../../src/app.module';

describe('Blogs Positive (e2e)', () => {
  let app: INestApplication;
  let mongoServer: MongoMemoryServer;
  let blogsTestManager: BlogsTestManager;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TestModule, MongooseModule.forRoot(mongoUri)],
    }).compile();

    app = moduleFixture.createNestApplication();
    const commonConfig = app.get(CommonConfig);
    await appSetup(app, commonConfig);
    blogsTestManager = new BlogsTestManager(app);

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

  afterEach(async () => {
    await request(app.getHttpServer()).delete(
      API_PREFIX + API_PATH.TEST_DELETE,
    );
  });

  it('Should - get empty array when no blogs created', async () => {
    return request(app.getHttpServer())
      .get(API_PREFIX + API_PATH.BLOGS)
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

  it('should POST a blog successfully and GET', async () => {
    const response = await request(app.getHttpServer())
      .post(API_PREFIX + API_PATH.BLOGS)
      .send({
        name: 'Blog Name',
        description: 'Desc',
        websiteUrl: 'https://google.com',
      })
      .set('authorization', basicAuthHeader)
      .expect(HttpStatus.CREATED);

    expect(response.body).toEqual({
      name: 'Blog Name',
      description: 'Desc',
      websiteUrl: 'https://google.com',
      isMembership: false,
      id: expect.any(String),
      createdAt: expect.any(String),
    });
  });

  it('Should get created blog', async () => {
    const createdBlog = await blogsTestManager.createBlog({
      name: 'Blog Name',
      description: 'Desc',
      websiteUrl: 'https://google.com',
    });

    const getResponse = await request(app.getHttpServer())
      .get(`${API_PREFIX + API_PATH.BLOGS}/${createdBlog.id}`)
      .expect(HttpStatus.OK);

    expect(getResponse.body).toEqual(createdBlog);
  });

  it('should GET blogs by searchNameTerm successfully', async () => {
    const blog = await blogsTestManager.createBlog({
      name: 'bOdY',
      websiteUrl: 'https://test-domain.com',
      description: 'This is a description for a blog name current',
    });

    const response1 = await request(app.getHttpServer())
      .get(`${API_PREFIX}${API_PATH.BLOGS}/?searchNameTerm=BODY`)
      .expect(HttpStatus.OK);

    expect(response1.body.items).toEqual(expect.arrayContaining([blog]));

    const response2 = await request(app.getHttpServer())
      .get(`${API_PREFIX}${API_PATH.BLOGS}/?searchNameTerm=body`)
      .expect(HttpStatus.OK);

    expect(response2.body.items).toEqual(expect.arrayContaining([blog]));
  });

  it('should PUT blog successfully', async () => {
    const blog = await blogsTestManager.createBlog({
      name: 'Blog Name',
      description: 'Desc',
      websiteUrl: 'https://google.com',
    });
    const newBody: UpdateBlogInput = {
      name: 'newBlogName',
      description: blog.description,
      websiteUrl: blog.websiteUrl,
    };

    await request(app.getHttpServer())
      .put(`${API_PREFIX}${API_PATH.BLOGS}/${blog.id}`)
      .send(newBody)
      .set('authorization', basicAuthHeader)
      .expect(HttpStatus.NO_CONTENT);

    const getResponse = await request(app.getHttpServer())
      .get(`${API_PREFIX}${API_PATH.BLOGS}/${blog.id}`)
      .expect(HttpStatus.OK);

    expect(getResponse.body).toEqual({ ...blog, name: newBody.name });
  });

  it('should GET blogs using sorting successfully', async () => {
    const blogs = await blogsTestManager.createBlogs(5);

    const response1 = await request(app.getHttpServer())
      .get(
        `${API_PREFIX}${API_PATH.BLOGS}/?sortBy=name&sortDirection=asc&searchNameTerm=tor`,
      )
      .expect(HttpStatus.OK);

    expect(response1.body.items[0].name).toEqual(blogs[0].name);

    const response2 = await request(app.getHttpServer())
      .get(
        `${API_PREFIX}${API_PATH.BLOGS}/?sortBy=name&sortDirection=desc&searchNameTerm=tor`,
      )
      .expect(HttpStatus.OK);

    expect(response2.body.items[0].name).toEqual(blogs[blogs.length - 1].name);
  });

  it('should GET blogs using pagination successfully', async () => {
    const blogs = await blogsTestManager.createBlogs(5);

    const getResponse = await request(app.getHttpServer())
      .get(
        `${API_PREFIX}${API_PATH.BLOGS}/?pageSize=2&pageNumber=2&searchNameTerm=${blogs[0].name.slice(0, 3)}`,
      )
      .expect(HttpStatus.OK);

    expect(getResponse.body).toEqual({
      items: expect.any(Array),
      totalCount: 5,
      pagesCount: 3,
      pageSize: 2,
      page: 2,
    });
    expect(getResponse.body.items).toHaveLength(2);
  });

  it('should POST post for a certain blog', async () => {
    const blog = await blogsTestManager.createBlog({
      name: 'Blog Name',
      description: 'Desc',
      websiteUrl: 'https://google.com',
    });

    const response = await request(app.getHttpServer())
      .post(`${API_PREFIX}${API_PATH.BLOGS}/${blog.id}/posts`)
      .send({
        title: 'Post',
        shortDescription: 'desc',
        blogId: blog.id,
        content: 'post content',
      } as CreatePostInputDto)
      .set('authorization', basicAuthHeader)
      .expect(HttpStatus.CREATED);

    expect(response.body).toEqual({
      title: 'Post',
      shortDescription: 'desc',
      blogId: blog.id,
      content: 'post content',
      id: expect.any(String),
      createdAt: expect.any(String),
      blogName: blog.name,
      extendedLikesInfo: expect.any(Object),
    });

    const getResponse = await request(app.getHttpServer())
      .get(`${API_PREFIX}${API_PATH.POSTS}/${response.body.id}`)
      .expect(HttpStatus.OK);

    expect(getResponse.body).toEqual({
      title: 'Post',
      shortDescription: 'desc',
      blogId: blog.id,
      content: 'post content',
      id: expect.any(String),
      createdAt: expect.any(String),
      blogName: blog.name,
      extendedLikesInfo: expect.any(Object),
    });
  });

  it('should DELETE blog successfully', async () => {
    const blog = await blogsTestManager.createBlog({
      name: 'name',
      websiteUrl: 'https://google.com',
      description: 'some desc',
    });

    await request(app.getHttpServer())
      .delete(`${API_PREFIX}${API_PATH.BLOGS}/${blog.id}`)
      .set('authorization', basicAuthHeader)
      .expect(HttpStatus.NO_CONTENT);

    await request(app.getHttpServer())
      .get(`${API_PREFIX}${API_PATH.BLOGS}/${blog.id}`)
      .expect(HttpStatus.NOT_FOUND);
  });
});
