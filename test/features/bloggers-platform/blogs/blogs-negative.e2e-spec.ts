import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongooseModule } from '@nestjs/mongoose';
import { API_PATH } from '../../../../src/common/constants';
import { API_PREFIX } from '../../../../src/settings/global-prefix.setup';
import { appSetup } from '../../../../src/settings/app.setup';
import { BlogsTestManager } from '../../../helpers/blogs-test-manager';
import { ObjectId } from 'mongodb';
import { createBlogInput, createPostInput } from '../../../helpers/inputs';
import { TestingModule as TestModule } from '../../../../src/features/testing/testing.module';
import { CommonConfig } from '../../../../src/common/common.config';
import { basicAuthHeader } from '../../../helpers/users-test-manager';

describe('Blogs Negative (e2e)', () => {
  let app: INestApplication;
  let mongoServer: MongoMemoryServer;
  let blogsTestManager: BlogsTestManager;
  let randomId;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TestModule, MongooseModule.forRoot(mongoUri)],
    }).compile();

    app = moduleFixture.createNestApplication();
    const commonConfig = app.get(CommonConfig);
    appSetup(app, commonConfig);
    blogsTestManager = new BlogsTestManager(app);
    randomId = new ObjectId();

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

  it('should return 400 for GET by id not correct ObjectId', async () => {
    const response = await request(app.getHttpServer())
      .get(`${API_PREFIX}${API_PATH.BLOGS}/12345`)
      .expect(HttpStatus.BAD_REQUEST);

    expect(response.body).toEqual({
      errorsMessages: [
        {
          field: 'id',
          message: 'id must be a mongodb id',
        },
      ],
    });
  });

  it('should return 400 for DELETE by id not correct ObjectId', async () => {
    const response = await request(app.getHttpServer())
      .delete(`${API_PREFIX}${API_PATH.BLOGS}/12345`)
      .set('authorization', basicAuthHeader)
      .expect(HttpStatus.BAD_REQUEST);

    expect(response.body).toEqual({
      errorsMessages: [
        {
          field: 'id',
          message: 'id must be a mongodb id',
        },
      ],
    });
  });

  it('should return 400 for PUT by id not correct ObjectId', async () => {
    const response = await request(app.getHttpServer())
      .put(`${API_PREFIX}${API_PATH.BLOGS}/12345`)
      .send(createBlogInput)
      .set('authorization', basicAuthHeader)
      .expect(HttpStatus.BAD_REQUEST);

    expect(response.body).toEqual({
      errorsMessages: [
        {
          field: 'id',
          message: 'id must be a mongodb id',
        },
      ],
    });
  });

  it('should return 404 for GET not existing blog', async () => {
    await request(app.getHttpServer())
      .get(`${API_PREFIX}${API_PATH.BLOGS}/${randomId}`)
      .expect(HttpStatus.NOT_FOUND);
  });

  it('should return 404 for DELETE not existing blog', async () => {
    await request(app.getHttpServer())
      .delete(`${API_PREFIX}${API_PATH.BLOGS}/${randomId}`)
      .set('authorization', basicAuthHeader)
      .expect(HttpStatus.NOT_FOUND);
  });

  it('should return 404 for PUT not existing blog', async () => {
    await request(app.getHttpServer())
      .put(`${API_PREFIX}${API_PATH.BLOGS}/${randomId}`)
      .send(createBlogInput)
      .set('authorization', basicAuthHeader)
      .expect(HttpStatus.NOT_FOUND);
  });

  it('should return 400 for empty NAME while POST blog', async () => {
    const response = await request(app.getHttpServer())
      .post(API_PREFIX + API_PATH.BLOGS)
      .send({ ...createBlogInput, name: '' })
      .set('authorization', basicAuthHeader)
      .expect(HttpStatus.BAD_REQUEST);

    expect(response.body).toEqual({
      errorsMessages: [
        {
          field: 'name',
          message: 'name should not be empty',
        },
      ],
    });
  });

  it('should return 404 for POST post for a not existing blog', async () => {
    const randomObjectId = new ObjectId();

    await request(app.getHttpServer())
      .post(`${API_PREFIX}${API_PATH.BLOGS}/${randomId}/posts`)
      .send({ ...createPostInput, blogId: randomObjectId })
      .set('authorization', basicAuthHeader)
      .expect(HttpStatus.NOT_FOUND);
  });

  it('should return 400 for incorrect NAME type while POST blog', async () => {
    const response = await request(app.getHttpServer())
      .post(API_PREFIX + API_PATH.BLOGS)
      .send({ ...createBlogInput, name: true })
      .set('authorization', basicAuthHeader)
      .expect(HttpStatus.BAD_REQUEST);

    expect(response.body).toEqual({
      errorsMessages: [
        {
          field: 'name',
          message: 'name must be a string',
        },
      ],
    });
  });

  it('should return 400 for incorrect NAME length while POST blog', async () => {
    const response = await request(app.getHttpServer())
      .post(API_PREFIX + API_PATH.BLOGS)
      .send({ ...createBlogInput, name: 'name567890123456' })
      .set('authorization', basicAuthHeader)
      .expect(HttpStatus.BAD_REQUEST);

    expect(response.body).toEqual({
      errorsMessages: [
        {
          field: 'name',
          message: 'name must be shorter than or equal to 15 characters',
        },
      ],
    });
  });

  it('should return 400 for incorrect NAME length while POST blog', async () => {
    const response = await request(app.getHttpServer())
      .post(API_PREFIX + API_PATH.BLOGS)
      .send({ ...createBlogInput, name: 'name567890123456' })
      .set('authorization', basicAuthHeader)
      .expect(HttpStatus.BAD_REQUEST);

    expect(response.body).toEqual({
      errorsMessages: [
        {
          field: 'name',
          message: 'name must be shorter than or equal to 15 characters',
        },
      ],
    });
  });

  it('should return 400 for incorrect NAME while PUT blog', async () => {
    const createdBlog = await blogsTestManager.createBlog({
      name: 'name',
      description: 'descr',
      websiteUrl: 'https://google.com',
    });

    const editResponse = await request(app.getHttpServer())
      .put(`${API_PREFIX}${API_PATH.BLOGS}/${createdBlog.id}`)
      .send({ ...createBlogInput, name: '' })
      .set('authorization', basicAuthHeader)
      .expect(HttpStatus.BAD_REQUEST);

    expect(editResponse.body).toEqual({
      errorsMessages: [
        {
          field: 'name',
          message: 'name should not be empty',
        },
      ],
    });
  });

  it('should return 400 for incorrect NAME while PUT blog', async () => {
    const createdBlog = await blogsTestManager.createBlog({
      name: 'name',
      description: 'descr',
      websiteUrl: 'https://google.com',
    });

    const editResponse = await request(app.getHttpServer())
      .put(`${API_PREFIX}${API_PATH.BLOGS}/${createdBlog.id}`)
      .send({ ...createBlogInput, name: 'name567890123456' })
      .set('authorization', basicAuthHeader)
      .expect(HttpStatus.BAD_REQUEST);

    expect(editResponse.body).toEqual({
      errorsMessages: [
        {
          field: 'name',
          message: 'name must be shorter than or equal to 15 characters',
        },
      ],
    });
  });

  it('should return 401 when no Auth Header for POST blog request', async () => {
    await request(app.getHttpServer())
      .post(API_PREFIX + API_PATH.BLOGS)
      .send(createBlogInput)
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('should return 401 when no Auth Header for PUT blog request', async () => {
    const blog = await blogsTestManager.createBlog(createBlogInput);

    await request(app.getHttpServer())
      .put(`${API_PREFIX}${API_PATH.BLOGS}/${blog.id}`)
      .send(createBlogInput)
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('should return 401 when no Auth Header for DELETE blog request', async () => {
    const blog = await blogsTestManager.createBlog(createBlogInput);

    await request(app.getHttpServer())
      .delete(`${API_PREFIX}${API_PATH.BLOGS}/${blog.id}`)
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('should return 401 when Auth Header is incorrect for DELETE blog request', async () => {
    const blog = await blogsTestManager.createBlog(createBlogInput);

    await request(app.getHttpServer())
      .delete(`${API_PREFIX}${API_PATH.BLOGS}/${blog.id}`)
      .set('authorization', 'test')
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('should return 400 while GET posts for a not existing blog', async () => {
    const objectId = new ObjectId();

    await request(app.getHttpServer())
      .get(`${API_PREFIX}${API_PATH.BLOGS}/${objectId}/posts`)
      .expect(HttpStatus.NOT_FOUND);
  });

  it('should return 400 for GET blog sortBy as number', async () => {
    const response = await request(app.getHttpServer())
      .get(`${API_PREFIX}${API_PATH.BLOGS}/?sortBy=67`)
      .expect(HttpStatus.BAD_REQUEST);

    expect(response.body).toEqual({
      errorsMessages: [
        {
          field: 'sortBy',
          message:
            'sortBy must be one of the following values: createdAt, name, description, websiteUrl',
        },
      ],
    });
  });

  it('should return 400 for PUT blog invalid url', async () => {
    const createdBlog = await blogsTestManager.createBlog({
      name: 'name',
      description: 'descr',
      websiteUrl: 'https://google.com',
    });

    const response = await request(app.getHttpServer())
      .put(`${API_PREFIX}${API_PATH.BLOGS}/${createdBlog.id}`)
      .set('authorization', basicAuthHeader)
      .send({ ...createBlogInput, websiteUrl: 'http://localhost:8000/' })
      .expect(HttpStatus.BAD_REQUEST);

    expect(response.body).toEqual({
      errorsMessages: [
        {
          field: 'websiteUrl',
          message: 'websiteUrl must be a URL address',
        },
      ],
    });
  });
});
