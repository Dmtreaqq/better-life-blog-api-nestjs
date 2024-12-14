import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { BloggersPlatformModule } from '../../../../src/features/bloggers-platform/bloggers-platform.module';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongooseModule } from '@nestjs/mongoose';
import { AppModule } from '../../../../src/app.module';

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
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await mongoServer.stop();
  });

  it('/blogs - get empty array when no blogs created', async () => {
    return request(app.getHttpServer())
      .get('/blogs')
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
});
