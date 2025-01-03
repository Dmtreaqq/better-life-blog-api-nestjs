import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { CreateUserInputDto } from '../../src/features/user-platform/api/input-dto/create-user.input-dto';
import {
  MeViewDto,
  UserViewDto,
} from '../../src/features/user-platform/api/view-dto/users.view-dto';
import { API_PREFIX } from '../../src/settings/global-prefix.setup';
import { delay } from 'rxjs';
import { API_PATH } from '../../src/common/constants';
import { fromUTF8ToBase64 } from '../../src/common/guards/basic-auth.guard';

import { RegistrationUserDto } from '../../src/features/user-platform/api/input-dto/registration-user.dto';

export const basicAuthHeader = `Basic ${fromUTF8ToBase64(process.env.BASIC_LOGIN)}`;

export class UsersTestManager {
  constructor(private app: INestApplication) {}

  // async getUserFromDBbyEmail(email: string): Promise<UserDocument> {
  //   return this.usersRepo.findByEmail(email);
  // }

  async registerUser(createModel: RegistrationUserDto): Promise<void> {
    await request(this.app.getHttpServer())
      .post(API_PREFIX + API_PATH.AUTH + '/registration')
      .send(createModel)
      .expect(HttpStatus.NO_CONTENT);
  }

  async createUser(
    createModel: CreateUserInputDto,
    statusCode: number = HttpStatus.CREATED,
  ): Promise<UserViewDto> {
    const response = await request(this.app.getHttpServer())
      .post(`${API_PREFIX}${API_PATH.USERS}`)
      .send(createModel)
      .set('authorization', basicAuthHeader)
      .expect(statusCode);

    return response.body;
  }

  async login(
    login: string,
    password: string,
    statusCode: number = HttpStatus.OK,
  ): Promise<{ accessToken: string }> {
    const response = await request(this.app.getHttpServer())
      .post(`${API_PREFIX}/auth/login`)
      .send({ loginOrEmail: login, password })
      .expect(statusCode);

    return {
      accessToken: response.body.accessToken,
    };
  }

  async loginWithUserAgent(email: string, password: string, userAgent: string) {
    const response = await request(this.app.getHttpServer())
      .post(API_PREFIX + API_PATH.AUTH + '/login')
      .set('user-agent', userAgent)
      .send({
        loginOrEmail: email,
        password,
      });
    console.log(response.headers);

    return {
      accessToken: response.body.accessToken,
      refreshToken: response.headers['set-cookie'][0],
    };
  }

  async me(
    accessToken: string,
    statusCode: number = HttpStatus.OK,
  ): Promise<MeViewDto> {
    const response = await request(this.app.getHttpServer())
      .get(`/${API_PREFIX}/auth/me`)
      .auth(accessToken, { type: 'bearer' })
      .expect(statusCode);

    return response.body;
  }

  async createSeveralUsers(count: number): Promise<UserViewDto[]> {
    const usersPromises = [] as Promise<UserViewDto>[];

    for (let i = 0; i < count; ++i) {
      await delay(50);
      const response = this.createUser({
        login: `test` + i,
        email: `test${i}@gmail.com`,
        password: '123456789',
      });
      usersPromises.push(response);
    }

    return Promise.all(usersPromises);
  }

  async createAndLoginSeveralUsers(
    count: number,
  ): Promise<{ accessToken: string }[]> {
    const users = await this.createSeveralUsers(count);

    const loginPromises = users.map((user: UserViewDto) =>
      this.login(user.login, '123456789'),
    );

    return await Promise.all(loginPromises);
  }
}
