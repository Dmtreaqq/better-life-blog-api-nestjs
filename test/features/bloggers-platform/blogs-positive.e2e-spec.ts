import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { BloggersPlatformModule } from '../../../src/features/bloggers-platform/bloggers-platform.module';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongooseModule } from '@nestjs/mongoose';
import { API_PATH } from '../../../src/common/config';
import { API_PREFIX } from '../../../src/settings/global-prefix.setup';
import { appSetup } from '../../../src/settings/app.setup';
import { BlogsTestManager } from '../../helpers/blogs-test-manager';
import { UpdateBlogInput } from '../../../src/features/bloggers-platform/api/input-dto/update-blog.dto';

describe('Blogs Positive (e2e)', () => {
  let app: INestApplication;
  let mongoServer: MongoMemoryServer;
  let blogsTestManager: BlogsTestManager;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [BloggersPlatformModule, MongooseModule.forRoot(mongoUri)],
    }).compile();

    app = moduleFixture.createNestApplication();
    appSetup(app);
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
      // .set('authorization', authHeader)
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
      // .set('authorization', authHeader)
      .expect(HttpStatus.NO_CONTENT);

    const getResponse = await request(app.getHttpServer())
      .get(`${API_PREFIX}${API_PATH.BLOGS}/${blog.id}`)
      .expect(HttpStatus.OK);

    expect(getResponse.body).toEqual({ ...blog, name: newBody.name });
  });
});
