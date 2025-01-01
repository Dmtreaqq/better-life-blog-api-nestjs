import { HttpStatus, INestApplication } from '@nestjs/common';
import { MongoMemoryServer } from 'mongodb-memory-server';
import * as request from 'supertest';
import { API_PREFIX } from '../../../../src/settings/global-prefix.setup';
import { API_PATH } from '../../../../src/common/constants';
import {
  basicAuthHeader,
  UsersTestManager,
} from '../../../helpers/users-test-manager';
import { createUserInput } from '../../../helpers/inputs';
import { MeViewDto } from '../../../../src/features/user-platform/api/view-dto/users.view-dto';
import { UsersRepository } from '../../../../src/features/user-platform/repositories/users.repository';
import { initSettings } from '../../../helpers/init-settings';

describe('Auth Positive (e2e)', () => {
  let app: INestApplication;
  let mongoServer: MongoMemoryServer;
  let usersTestManager: UsersTestManager;
  let usersRepository: UsersRepository;

  beforeAll(async () => {
    const result = await initSettings();
    app = result.app;

    usersTestManager = result.usersTestManager;
    usersRepository = result.app.get<UsersRepository>(UsersRepository);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await request(app.getHttpServer()).delete(
      `${API_PREFIX}${API_PATH.TEST_DELETE}`,
    );
  });

  afterEach(async () => {
    await request(app.getHttpServer()).delete(
      `${API_PREFIX}${API_PATH.TEST_DELETE}`,
    );
  });

  it('should return 204 when POST successful registration', async () => {
    await request(app.getHttpServer())
      .post(API_PREFIX + API_PATH.AUTH + '/registration')
      .send(createUserInput)
      .expect(HttpStatus.NO_CONTENT);

    const response = await request(app.getHttpServer())
      .get(API_PREFIX + API_PATH.USERS)
      .set('authorization', basicAuthHeader)
      .expect(HttpStatus.OK);

    expect(response.body.items).toEqual([
      {
        login: createUserInput.login,
        email: createUserInput.email,
        id: expect.any(String),
        createdAt: expect.any(String),
      },
    ]);
  });

  it('should POST /login with login successfully and get user info', async () => {
    await usersTestManager.registerUser(createUserInput);

    const response = await request(app.getHttpServer())
      .post(API_PREFIX + API_PATH.AUTH + '/login')
      .send({
        loginOrEmail: createUserInput.login,
        password: createUserInput.password,
      })
      .expect(HttpStatus.OK);

    expect(response.body).toEqual({
      accessToken: expect.any(String),
    });

    const meResponse = await request(app.getHttpServer())
      .get(API_PREFIX + API_PATH.AUTH + '/me')
      .set('authorization', `Bearer ${response.body.accessToken}`)
      .expect(HttpStatus.OK);

    expect(meResponse.body).toEqual({
      login: createUserInput.login,
      userId: expect.any(String),
      email: createUserInput.email,
    } as MeViewDto);
  });

  it('should POST /login with email successfully and get user info', async () => {
    await usersTestManager.registerUser(createUserInput);

    const response = await request(app.getHttpServer())
      .post(API_PREFIX + API_PATH.AUTH + '/login')
      .send({
        loginOrEmail: createUserInput.email,
        password: createUserInput.password,
      })
      .expect(HttpStatus.OK);

    expect(response.body).toEqual({
      accessToken: expect.any(String),
    });

    const meResponse = await request(app.getHttpServer())
      .get(API_PREFIX + API_PATH.AUTH + '/me')
      .set('authorization', `Bearer ${response.body.accessToken}`)
      .expect(HttpStatus.OK);

    expect(meResponse.body).toEqual({
      login: createUserInput.login,
      userId: expect.any(String),
      email: createUserInput.email,
    } as MeViewDto);
  });

  it('should return 204 when POST successful registration confirmation and send email', async () => {
    await usersTestManager.registerUser(createUserInput);
    const userFromDb = await usersRepository.findByEmail(createUserInput.email);

    await request(app.getHttpServer())
      .post(API_PREFIX + API_PATH.AUTH + '/registration-confirmation')
      .send({ code: userFromDb.confirmationCode })
      .expect(HttpStatus.NO_CONTENT);
  });

  it('should return 204 when POST successful email resend while confirm email', async () => {
    await usersTestManager.registerUser(createUserInput);

    await request(app.getHttpServer())
      .post(API_PREFIX + API_PATH.AUTH + '/registration-email-resending')
      .send({ email: createUserInput.email })
      .expect(HttpStatus.NO_CONTENT);
  });

  it('should return 204 when POST successful email send while password recover with EXISTING user', async () => {
    await usersTestManager.registerUser(createUserInput);
    const userFromDb = await usersRepository.findByEmail(createUserInput.email);

    await request(app.getHttpServer())
      .post(API_PREFIX + API_PATH.AUTH + '/password-recovery')
      .send({ email: userFromDb.email })
      .expect(HttpStatus.NO_CONTENT);
  });

  it('should return 204 when POST successful new password confirmation', async () => {
    await usersTestManager.registerUser(createUserInput);
    const userFromDb = await usersRepository.findByEmail(createUserInput.email);

    await request(app.getHttpServer())
      .post(API_PREFIX + API_PATH.AUTH + '/new-password')
      .send({
        recoveryCode: userFromDb.recoveryCode,
        newPassword: '654321',
      })
      .expect(HttpStatus.NO_CONTENT);
  });

  //
  // it('should return 200 when POST refreshToken', async () => {
  //   const user = await usersTestManager.createUser();
  //   const { refreshToken } = await authTestManager.loginByEmail(
  //     user.email,
  //     'password',
  //   );
  //
  //   const response = await request(app.getHttpServer())
  //     .post(API_PREFIX + API_PATH.AUTH + '/refresh-token')
  //     .set('Cookie', [refreshToken])
  //     .expect(HttpStatus.OK);
  //
  //   expect(response.header['set-cookie'][0]).not.toEqual(refreshToken);
  // });
  //
  // it('should return 204 when POST logout', async () => {
  //   const user = await usersTestManager.createUser();
  //   const { refreshToken } = await authTestManager.loginByEmail(
  //     user.email,
  //     'password',
  //   );
  //
  //   await request(app.getHttpServer())
  //     .post(API_PREFIX + API_PATH.AUTH + '/logout')
  //     .set('Cookie', [refreshToken])
  //     .expect(HttpStatus.NO_CONTENT);
  //
  //   await request(app.getHttpServer())
  //     .post(API_PREFIX + API_PATH.AUTH + '/refresh-token')
  //     .set('Cookie', [refreshToken])
  //     .expect(HttpStatus.NOT_AUTHORIZED_401);
  // });
  //
});
