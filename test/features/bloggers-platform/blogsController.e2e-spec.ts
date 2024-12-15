import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { BloggersPlatformModule } from '../../../src/features/bloggers-platform/bloggers-platform.module';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongooseModule } from '@nestjs/mongoose';
import { API_PATH } from '../../../src/common/config';
import { CreateBlogInput } from '../../../src/features/bloggers-platform/api/input-dto/create-blog.dto';
import { API_PREFIX } from '../../../src/settings/global-prefix.setup';
import { appSetup } from '../../../src/settings/app.setup';

const blogInput: CreateBlogInput = {
  name: 'Somebody Who',
  description: 'Some description' + Math.floor(Math.random() * 5 + 1),
  websiteUrl: 'https://somewebsite.com',
};

describe('Blogs Positive (e2e)', () => {
  let app: INestApplication;
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [BloggersPlatformModule, MongooseModule.forRoot(mongoUri)],
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

  afterEach(async () => {
    await request(app.getHttpServer()).delete(
      API_PREFIX + API_PATH.TEST_DELETE,
    );
  });

  describe('/blogs positive', () => {
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
        .send(blogInput)
        // .set('authorization', authHeader)
        .expect(HttpStatus.CREATED);

      expect(response.body).toEqual({
        ...blogInput,
        isMembership: false,
        id: expect.any(String),
        createdAt: expect.any(String),
      });

      const id = response.body.id;

      const getResponse = await request(app.getHttpServer())
        .get(`${API_PREFIX + API_PATH.BLOGS}/${id}`)
        .expect(HttpStatus.OK);

      expect(getResponse.body).toEqual({
        ...response.body,
      });
    });
  });
});
