import { HttpStatus, INestApplication } from '@nestjs/common';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { appSetup } from '../../../../src/settings/app.setup';
import * as request from 'supertest';
import { API_PREFIX } from '../../../../src/settings/global-prefix.setup';
import { API_PATH } from '../../../../src/common/constants';
import { TestingModule as TestModule } from '../../../../src/features/testing/testing.module';
import {
  UsersTestManager,
} from '../../../helpers/users-test-manager';
import { createUserInput } from '../../../helpers/inputs';
import { EmailService } from '../../../../src/features/communication/email.service';
import { EmailServiceMock } from '../../../mock/email-service.mock';
import { UsersRepository } from '../../../../src/features/user-platform/repositories/users.repository';
import { sub } from 'date-fns/sub';

describe('Auth Negative (e2e)', () => {
  let app: INestApplication;
  let mongoServer: MongoMemoryServer;
  let usersTestManager: UsersTestManager;
  let usersRepository: UsersRepository;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TestModule, MongooseModule.forRoot(mongoUri)],
    })
      .overrideProvider(EmailService)
      .useClass(EmailServiceMock)
      .compile();

    app = moduleFixture.createNestApplication();
    appSetup(app);

    usersTestManager = new UsersTestManager(app);
    usersRepository = moduleFixture.get<UsersRepository>(UsersRepository);

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

  it('should return 401 while POST with incorrect password', async () => {
    await usersTestManager.registerUser(createUserInput);

    await request(app.getHttpServer())
      .post(API_PREFIX + API_PATH.AUTH + '/login')
      .send({ loginOrEmail: createUserInput.email, password: '111' })
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('should return 401 while POST with not existing loginOrEmail', async () => {
    await usersTestManager.registerUser(createUserInput);

    await request(app.getHttpServer())
      .post(API_PREFIX + API_PATH.AUTH + '/login')
      .send({ password: createUserInput.password, loginOrEmail: 'notExisting' })
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('should return 400 while POST with empty loginOrEmail', async () => {
    await usersTestManager.registerUser(createUserInput);

    const response = await request(app.getHttpServer())
      .post(API_PREFIX + API_PATH.AUTH + '/login')
      .send({ password: createUserInput.password, loginOrEmail: '' })
      .expect(HttpStatus.BAD_REQUEST);

    expect(response.body).toEqual({
      errorsMessages: [
        {
          field: 'loginOrEmail',
          message: 'loginOrEmail should not be empty',
        },
      ],
    });
  });

  it('should return 400 while POST with empty password', async () => {
    await usersTestManager.registerUser(createUserInput);

    const response = await request(app.getHttpServer())
      .post(API_PREFIX + API_PATH.AUTH + '/login')
      .send({ loginOrEmail: createUserInput.login, password: '' })
      .expect(HttpStatus.BAD_REQUEST);

    expect(response.body).toEqual({
      errorsMessages: [
        {
          field: 'password',
          message: 'password should not be empty',
        },
      ],
    });
  });

  it('should return 400 while POST with number loginOrEmail', async () => {
    await usersTestManager.registerUser(createUserInput);

    const response = await request(app.getHttpServer())
      .post(API_PREFIX + API_PATH.AUTH + '/login')
      .send({ password: createUserInput.password, loginOrEmail: 123 })
      .expect(HttpStatus.BAD_REQUEST);

    expect(response.body).toEqual({
      errorsMessages: [
        {
          field: 'loginOrEmail',
          message: 'loginOrEmail must be a string',
        },
      ],
    });
  });

  it('should return 400 while POST with number password', async () => {
    await usersTestManager.registerUser(createUserInput);

    const response = await request(app.getHttpServer())
      .post(API_PREFIX + API_PATH.AUTH + '/login')
      .send({ loginOrEmail: createUserInput.email, password: 123 })
      .expect(HttpStatus.BAD_REQUEST);

    expect(response.body).toEqual({
      errorsMessages: [
        {
          field: 'password',
          message: 'password must be a string',
        },
      ],
    });
  });

  it('should return 400 when POST registration confirmation with wrong code', async () => {
    await usersTestManager.registerUser(createUserInput);

    const response = await request(app.getHttpServer())
      .post(API_PREFIX + API_PATH.AUTH + '/registration-confirmation')
      .send({ code: 'wrongCode' })
      .expect(HttpStatus.BAD_REQUEST);

    expect(response.body).toEqual({
      errorsMessages: [
        {
          field: 'code',
          message: 'Incorrect code',
        },
      ],
    });
  });

  it('should return 400 when POST registration confirmation with already confirmed user', async () => {
    await usersTestManager.registerUser(createUserInput);
    const registeredUser = await usersRepository.findByEmail(
      createUserInput.email,
    );

    await request(app.getHttpServer())
      .post(API_PREFIX + API_PATH.AUTH + '/registration-confirmation')
      .send({ code: registeredUser!.confirmationCode })
      .expect(HttpStatus.NO_CONTENT);

    const response = await request(app.getHttpServer())
      .post(API_PREFIX + API_PATH.AUTH + '/registration-confirmation')
      .send({ code: registeredUser!.confirmationCode })
      .expect(HttpStatus.BAD_REQUEST);

    expect(response.body).toEqual({
      errorsMessages: [
        {
          field: 'code',
          message: 'Code already used',
        },
      ],
    });
  });

  it('should return 400 when POST registration confirmation when code is expired', async () => {
    await usersTestManager.registerUser(createUserInput);
    const user = await usersRepository.findByEmail(createUserInput.email)
    user.confirmationCodeExpirationDate = sub(new Date(), { minutes: 4 }).toISOString()
    await usersRepository.save(user);

    const response = await request(app.getHttpServer())
      .post(API_PREFIX + API_PATH.AUTH + '/registration-confirmation')
      .send({ code: user.confirmationCode })
      .expect(HttpStatus.BAD_REQUEST);

    expect(response.body).toEqual({
      errorsMessages: [
        {
          field: 'code',
          message: 'Code expired',
        },
      ],
    });
  });

  it('should return 400 when POST registration confirmation with empty code', async () => {
    await usersTestManager.registerUser(createUserInput);

    const response = await request(app.getHttpServer())
      .post(API_PREFIX + API_PATH.AUTH + '/registration-confirmation')
      .send({ code: '' })
      .expect(HttpStatus.BAD_REQUEST);

    expect(response.body).toEqual({
      errorsMessages: [
        {
          field: 'code',
          message: 'code should not be empty',
        },
      ],
    });
  });

  it('should return 400 when POST registration confirmation with numeric code', async () => {
    await usersTestManager.registerUser(createUserInput);

    const response = await request(app.getHttpServer())
      .post(API_PREFIX + API_PATH.AUTH + '/registration-confirmation')
      .send({ code: 12345 })
      .expect(HttpStatus.BAD_REQUEST);

    expect(response.body).toEqual({
      errorsMessages: [
        {
          field: 'code',
          message: 'code must be a string',
        },
      ],
    });
  });

  it('should return 400 when POST email resend with already confirmed user', async () => {
    await usersTestManager.registerUser(createUserInput);
    const registeredUser = await usersRepository.findByEmail(
      createUserInput.email,
    );

    await request(app.getHttpServer())
      .post(API_PREFIX + API_PATH.AUTH + '/registration-confirmation')
      .send({ code: registeredUser!.confirmationCode })
      .expect(HttpStatus.NO_CONTENT);

    const response = await request(app.getHttpServer())
      .post(API_PREFIX + API_PATH.AUTH + '/registration-email-resending')
      .send({ email: registeredUser!.email })
      .expect(HttpStatus.BAD_REQUEST);

    expect(response.body).toEqual({
      errorsMessages: [
        {
          field: 'email',
          message: 'Email already confirmed',
        },
      ],
    });
  });

  it('should return 400 when POST email resend with not existing user', async () => {
    const response = await request(app.getHttpServer())
      .post(API_PREFIX + API_PATH.AUTH + '/registration-email-resending')
      .send({ email: 'notexists@gmail.com' })
      .expect(HttpStatus.BAD_REQUEST);

    expect(response.body).toEqual({
      errorsMessages: [
        {
          field: 'email',
          message: 'Invalid email',
        },
      ],
    });
  });

  it('should return 204 when POST successful email send while password recover with NOT EXISTING user', async () => {
    await request(app.getHttpServer())
      .post(API_PREFIX + API_PATH.AUTH + '/password-recovery')
      .send({ email: 'someemail@gmail.com' })
      .expect(HttpStatus.NO_CONTENT);
  });

  it('should return 400 when POST new-password with incorrect recover code', async () => {
    const response = await request(app.getHttpServer())
      .post(API_PREFIX + API_PATH.AUTH + '/new-password')
      .send({ recoveryCode: 'incorrect code', newPassword: '654321' })
      .expect(HttpStatus.BAD_REQUEST);

    expect(response.body).toEqual({
      errorsMessages: [
        {
          field: 'recoveryCode',
          message: 'Incorrect code',
        },
      ],
    });
  });
});
