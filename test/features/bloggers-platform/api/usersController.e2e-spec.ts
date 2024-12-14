import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { BloggersPlatformModule } from '../../../../src/features/bloggers-platform/bloggers-platform.module';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongooseModule } from '@nestjs/mongoose';
import { API_PATH } from '../../../../src/common/config';
import { CreateUserInputDto } from '../../../../src/features/user-platform/api/input-dto/users.input-dto';
import { UserPlatformModule } from '../../../../src/features/user-platform/user-platform.module';

const userInput: CreateUserInputDto = {
  login: 'login6',
  password: '123456',
  email: 'test-email@ukr.net',
};

describe('Users Positive (e2e)', () => {
  let app: INestApplication;
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [UserPlatformModule, MongooseModule.forRoot(mongoUri)],
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

  beforeEach(async () => {
    await request(app.getHttpServer()).delete(API_PATH.TEST_DELETE);
  });

  afterEach(async () => {
    await request(app.getHttpServer()).delete(API_PATH.TEST_DELETE);
  });

  describe('/users positive', () => {
    it('Should - get empty array when no users created', async () => {
      return request(app.getHttpServer())
        .get(API_PATH.USERS)
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

    it('should POST a User successfully and GET', async () => {
      const response = await request(app.getHttpServer())
        .post(API_PATH.USERS)
        .send(userInput)
        // .set('authorization', authHeader)
        .expect(HttpStatus.CREATED);

      expect(response.body).toEqual({
        login: userInput.login,
        email: userInput.email,
        id: expect.any(String),
        createdAt: expect.any(String),
      });

      const id = response.body.id;

      const getResponse = await request(app.getHttpServer())
        .get(`${API_PATH.USERS}/${id}`)
        .expect(HttpStatus.OK);

      expect(getResponse.body).toEqual({
        ...response.body,
      });
    });

    it('should Delete a User and GET Not Found', async () => {
      // Create user
      const response = await request(app.getHttpServer())
        .post(API_PATH.USERS)
        .send(userInput)
        // .set('authorization', authHeader)
        .expect(HttpStatus.CREATED);

      expect(response.body).toEqual({
        login: userInput.login,
        email: userInput.email,
        id: expect.any(String),
        createdAt: expect.any(String),
      });
      const id = response.body.id;

      await request(app.getHttpServer())
        .delete(`${API_PATH.USERS}/${id}`)
        .expect(HttpStatus.NO_CONTENT);

      await request(app.getHttpServer())
        .get(`${API_PATH.USERS}/${id}`)
        .expect(HttpStatus.NOT_FOUND);
    });
  });
});
