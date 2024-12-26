import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongooseModule } from '@nestjs/mongoose';
import { API_PATH } from '../../../../src/common/constants';
import { API_PREFIX } from '../../../../src/settings/global-prefix.setup';
import { appSetup } from '../../../../src/settings/app.setup';
import { BlogsTestManager } from '../../../helpers/blogs-test-manager';
import { TestingModule as TestModule } from '../../../../src/features/testing/testing.module';
import { CommonConfig } from '../../../../src/common/common.config';
import { UsersTestManager } from '../../../helpers/users-test-manager';
import { PostsTestManager } from '../../../helpers/posts-test-manager';
import {
  createBlogInput,
  createPostInput,
  createUserInput,
} from '../../../helpers/inputs';
import { CommentViewDto } from '../../../../src/features/bloggers-platform/api/view-dto/comment.view-dto';

const commentEntity: CommentViewDto = {
  id: '',
  content: 'Comment'.repeat(5),
  commentatorInfo: {
    userId: '123',
    userLogin: createUserInput.login,
  },
  createdAt: new Date(),
  likesInfo: {
    likesCount: 0,
    dislikesCount: 0,
    myStatus: 'None',
  },
};

describe('Comments Positive (e2e)', () => {
  let app: INestApplication;
  let mongoServer: MongoMemoryServer;
  let blogsTestManager: BlogsTestManager;
  let postsTestManager: PostsTestManager;
  let usersTestManager: UsersTestManager;

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
    postsTestManager = new PostsTestManager(app);
    usersTestManager = new UsersTestManager(app);

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

  it('should POST a comment successfully', async () => {
    await usersTestManager.createUser(createUserInput);
    const { accessToken: token } = await usersTestManager.login(
      createUserInput.login,
      createUserInput.password,
    );
    const blog = await blogsTestManager.createBlog(createBlogInput);
    const post = await postsTestManager.createPost({
      ...createPostInput,
      blogId: blog.id,
    });

    const response = await request(app.getHttpServer())
      .post(`${API_PREFIX}${API_PATH.POSTS}/${post.id}${API_PATH.COMMENTS}`)
      .set('authorization', `Bearer ${token}`)
      .send({
        content: commentEntity.content,
      })
      .expect(HttpStatus.CREATED);

    expect(response.body).toEqual({
      ...commentEntity,
      commentatorInfo: {
        ...commentEntity.commentatorInfo,
        userId: expect.any(String),
      },
      id: expect.any(String),
      createdAt: expect.any(String),
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: 'None',
      },
    });
  });
});
