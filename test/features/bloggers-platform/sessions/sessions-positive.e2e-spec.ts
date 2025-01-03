import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';

import { API_PATH } from '../../../../src/common/constants';
import { API_PREFIX } from '../../../../src/settings/global-prefix.setup';

import { BlogsTestManager } from '../../../helpers/blogs-test-manager';

import { UsersTestManager } from '../../../helpers/users-test-manager';
import { PostsTestManager } from '../../../helpers/posts-test-manager';
import { createUserInput } from '../../../helpers/inputs';

import { CommentsTestManager } from '../../../helpers/comments-test-manager';
import { initSettings } from '../../../helpers/init-settings';
import { UserViewDto } from '../../../../src/features/user-platform/api/view-dto/users.view-dto';
import { delay } from '../../../helpers/delay';

describe('Sessions Positive (e2e)', () => {
  let app: INestApplication;
  let refreshToken1: string;
  let refreshToken2: string;
  let refreshToken3: string;
  let refreshToken4: string;
  let user: UserViewDto;
  let responseSessions1: any;
  let blogsTestManager: BlogsTestManager;
  let postsTestManager: PostsTestManager;
  let usersTestManager: UsersTestManager;
  let commentsTestManager: CommentsTestManager;

  beforeAll(async () => {
    const result = await initSettings();
    app = result.app;
    blogsTestManager = result.blogsTestManager;
    postsTestManager = result.postsTestManager;
    usersTestManager = result.usersTestManager;
    commentsTestManager = result.commentsTestManager;

    user = await usersTestManager.createUser(createUserInput);
    const tokens1 = await usersTestManager.loginWithUserAgent(
      user.email,
      'password',
      'iPhone',
    );
    const tokens2 = await usersTestManager.loginWithUserAgent(
      user.email,
      'password',
      'Android',
    );
    const tokens3 = await usersTestManager.loginWithUserAgent(
      user.email,
      'password',
      'Web',
    );
    const tokens4 = await usersTestManager.loginWithUserAgent(
      user.email,
      'password',
      'Blackberry',
    );

    refreshToken1 = tokens1.refreshToken;
    refreshToken2 = tokens2.refreshToken;
    refreshToken3 = tokens3.refreshToken;
    refreshToken4 = tokens4.refreshToken;

    await app.init();
  });

  afterAll(async () => {
    await app.close();
    // await mongoServer.stop();
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

  it('Should get ALL sessions successfully with editing 1 session', async () => {
    responseSessions1 = await request(app.getHttpServer())
      .get(API_PREFIX + API_PATH.SECURITY + '/devices')
      .set('Cookie', [refreshToken1])
      .expect(HttpStatus.OK);

    expect(responseSessions1.body).toEqual([
      {
        title: 'iPhone',
        ip: expect.any(String),
        lastActiveDate: expect.any(String),
        deviceId: expect.any(String),
      },
      {
        title: 'Android',
        ip: expect.any(String),
        lastActiveDate: expect.any(String),
        deviceId: expect.any(String),
      },
      {
        title: 'Web',
        ip: expect.any(String),
        lastActiveDate: expect.any(String),
        deviceId: expect.any(String),
      },
      {
        title: 'Blackberry',
        ip: expect.any(String),
        lastActiveDate: expect.any(String),
        deviceId: expect.any(String),
      },
    ]);

    await delay(3000);

    const response = await request(app.getHttpServer())
      .post(API_PREFIX + API_PATH.AUTH + '/refresh-token')
      .set('Cookie', [refreshToken1])
      .expect(HttpStatus.OK);

    const newToken = response.headers['set-cookie'][0];
    const responseSessions2 = await request(app.getHttpServer())
      .get(API_PREFIX + API_PATH.SECURITY + '/devices')
      .set('Cookie', [newToken])
      .expect(HttpStatus.OK);

    const firstSessionFromFirstReq = responseSessions1.body[0];

    expect(firstSessionFromFirstReq.lastActiveDate).not.toEqual(
      responseSessions2.body[0].lastActiveDate,
    );
    expect(firstSessionFromFirstReq).toEqual({
      lastActiveDate: expect.any(String),
      ip: firstSessionFromFirstReq.ip,
      title: firstSessionFromFirstReq.title,
      deviceId: firstSessionFromFirstReq.deviceId,
    });
    expect(responseSessions2.body.length).toEqual(
      responseSessions1.body.length,
    );
    expect(responseSessions1.body.slice(1)).toEqual(
      responseSessions2.body.slice(1),
    );
  });

  //   it('Should logout device and not showing that session', async () => {
  //     await request
  //       .post(baseUrl + CONFIG.PATH.AUTH + '/logout')
  //       .set('Cookie', [refreshToken3])
  //       .expect(HTTP_STATUSES.NO_CONTENT_204);
  //
  //     const responseSessions1 = await request
  //       .get(baseUrl + CONFIG.PATH.SECURITY + '/devices')
  //       .set('Cookie', [refreshToken4])
  //       .expect(HTTP_STATUSES.OK_200);
  //
  //     // Check third SESSION deleted
  //     expect(
  //       responseSessions1.body.some(
  //         (obj: { title: string }) => obj.title === 'Web',
  //       ),
  //     ).toEqual(false);
  //   });
  //
  //   it('Should return 204 while delete yours deviceId session', async () => {
  //     await request
  //       .delete(
  //         baseUrl +
  //           CONFIG.PATH.SECURITY +
  //           `/devices/${responseSessions1.body[1].deviceId}`,
  //       )
  //       .set('Cookie', [refreshToken4])
  //       .expect(HTTP_STATUSES.NO_CONTENT_204);
  //
  //     const responseSessions3 = await request
  //       .get(baseUrl + CONFIG.PATH.SECURITY + '/devices')
  //       .set('Cookie', [refreshToken4])
  //       .expect(HTTP_STATUSES.OK_200);
  //
  //     // Check third SESSION deleted
  //     expect(
  //       responseSessions3.body.some(
  //         (obj: { title: string }) => obj.title === 'Android',
  //       ),
  //     ).toEqual(false);
  //   });
  //
  //   it('Should return 204 while delete all other sessions', async () => {
  //     await request
  //       .delete(baseUrl + CONFIG.PATH.SECURITY + `/devices`)
  //       .set('Cookie', [refreshToken4])
  //       .expect(HTTP_STATUSES.NO_CONTENT_204);
  //
  //     const responseSessions4 = await request
  //       .get(baseUrl + CONFIG.PATH.SECURITY + '/devices')
  //       .set('Cookie', [refreshToken4])
  //       .expect(HTTP_STATUSES.OK_200);
  //
  //     // Check ALL SESSIONs are deleted
  //     expect(responseSessions4.body).toEqual([responseSessions1.body[3]]);
  //   });
  // });
});
