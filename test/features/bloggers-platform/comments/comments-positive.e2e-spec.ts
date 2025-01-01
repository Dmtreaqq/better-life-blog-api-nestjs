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
import { CommentsTestManager } from '../../../helpers/comments-test-manager';
import { initSettings } from '../../../helpers/init-settings';

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
  let commentsTestManager: CommentsTestManager;

  beforeAll(async () => {
    const result = await initSettings();
    app = result.app;
    blogsTestManager = result.blogsTestManager;
    postsTestManager = result.postsTestManager;
    usersTestManager = result.usersTestManager;
    commentsTestManager = result.commentsTestManager;

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

  it('should GET a comment successfully', async () => {
    const user = await usersTestManager.createUser(createUserInput);
    const blog = await blogsTestManager.createBlog(createBlogInput);
    const post = await postsTestManager.createPost({
      ...createPostInput,
      blogId: blog.id,
    });
    const { accessToken: token } = await usersTestManager.login(
      user.login,
      createUserInput.password,
    );
    const comment = await commentsTestManager.createComment(
      { content: 'This is a very long comment' },
      token,
      post.id,
    );

    const response = await request(app.getHttpServer())
      .get(API_PREFIX + API_PATH.COMMENTS + `/${comment.id}`)
      .expect(HttpStatus.OK);

    expect(response.body).toEqual({
      ...comment,
      content: comment.content,
      id: expect.any(String),
      createdAt: expect.any(String),
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: 'None',
      },
    });
  });

  it('should GET comments successfully', async () => {
    const user = await usersTestManager.createUser(createUserInput);
    const blog = await blogsTestManager.createBlog(createBlogInput);
    const post = await postsTestManager.createPost({
      ...createPostInput,
      blogId: blog.id,
    });
    const { accessToken: token } = await usersTestManager.login(
      user.login,
      createUserInput.password,
    );
    await commentsTestManager.createComments(2, token, post.id);

    const response = await request(app.getHttpServer())
      .get(`${API_PREFIX}${API_PATH.POSTS}/${post.id}${API_PATH.COMMENTS}`)
      .expect(HttpStatus.OK);

    expect(response.body).toEqual({
      page: 1,
      pageSize: 10,
      totalCount: 2,
      pagesCount: 1,
      items: expect.any(Array),
    });
  });

  it('should DELETE a comment successfully', async () => {
    const user = await usersTestManager.createUser(createUserInput);
    const blog = await blogsTestManager.createBlog(createBlogInput);
    const post = await postsTestManager.createPost({
      ...createPostInput,
      blogId: blog.id,
    });
    const { accessToken: token } = await usersTestManager.login(
      user.login,
      createUserInput.password,
    );
    const comment = await commentsTestManager.createComment(
      { content: 'This is a very long comment' },
      token,
      post.id,
    );

    await request(app.getHttpServer())
      .del(API_PREFIX + API_PATH.COMMENTS + `/${comment.id}`)
      .set('authorization', `Bearer ${token}`)
      .expect(HttpStatus.NO_CONTENT);

    await request(app.getHttpServer())
      .get(API_PREFIX + API_PATH.COMMENTS + `/${comment.id}`)
      .expect(HttpStatus.NOT_FOUND);
  });

  it('should PUT a comment successfully', async () => {
    const user = await usersTestManager.createUser(createUserInput);
    const blog = await blogsTestManager.createBlog(createBlogInput);
    const post = await postsTestManager.createPost({
      ...createPostInput,
      blogId: blog.id,
    });
    const { accessToken: token } = await usersTestManager.login(
      user.login,
      createUserInput.password,
    );
    const comment = await commentsTestManager.createComment(
      { content: 'This is a very long comment' },
      token,
      post.id,
    );

    await request(app.getHttpServer())
      .put(API_PREFIX + API_PATH.COMMENTS + `/${comment.id}`)
      .set('authorization', `Bearer ${token}`)
      .send({
        content: 'This comment was changed because of test scenario',
      })
      .expect(HttpStatus.NO_CONTENT);

    const getResponse = await request(app.getHttpServer())
      .get(API_PREFIX + API_PATH.COMMENTS + `/${comment.id}`)
      .expect(HttpStatus.OK);

    expect(getResponse.body).toEqual({
      ...comment,
      id: expect.any(String),
      createdAt: expect.any(String),
      content: 'This comment was changed because of test scenario',
    });
  });

  it('should PUT LIKE and DISLIKE comment successfully', async () => {
    const blog = await blogsTestManager.createBlog(createBlogInput);
    const post = await postsTestManager.createPost({
      ...createPostInput,
      blogId: blog.id,
    });
    const user = await usersTestManager.createUser(createUserInput);
    const { accessToken: token } = await usersTestManager.login(
      user.login,
      createUserInput.password,
    );
    const comment = await commentsTestManager.createComment(
      { content: 'Some content for comment' },
      token,
      post.id,
    );

    await request(app.getHttpServer())
      .put(API_PREFIX + API_PATH.COMMENTS + `/${comment.id}/like-status`)
      .set('authorization', `Bearer ${token}`)
      .send({
        likeStatus: 'Like',
      })
      .expect(HttpStatus.NO_CONTENT);

    const getResponse1 = await request(app.getHttpServer())
      .get(API_PREFIX + API_PATH.COMMENTS + `/${comment.id}`)
      .set('authorization', `Bearer ${token}`)
      .expect(HttpStatus.OK);

    expect(getResponse1.body).toEqual({
      ...comment,
      id: expect.any(String),
      createdAt: expect.any(String),
      likesInfo: {
        likesCount: 1,
        dislikesCount: 0,
        myStatus: 'Like',
      },
    });

    await request(app.getHttpServer())
      .put(API_PREFIX + API_PATH.COMMENTS + `/${comment.id}/like-status`)
      .set('authorization', `Bearer ${token}`)
      .send({
        likeStatus: 'Dislike',
      })
      .expect(HttpStatus.NO_CONTENT);

    const getResponse2 = await request(app.getHttpServer())
      .get(API_PREFIX + API_PATH.COMMENTS + `/${comment.id}`)
      //   .set('Cookie', [refreshToken])
      .set('authorization', `Bearer ${token}`)
      .expect(HttpStatus.OK);

    expect(getResponse2.body).toEqual({
      ...comment,
      id: expect.any(String),
      createdAt: expect.any(String),
      likesInfo: {
        likesCount: 0,
        dislikesCount: 1,
        myStatus: 'Dislike',
      },
    });
  });

  it('should PUT None comment successfully', async () => {
    const blog = await blogsTestManager.createBlog(createBlogInput);
    const post = await postsTestManager.createPost({
      ...createPostInput,
      blogId: blog.id,
    });
    const user = await usersTestManager.createUser(createUserInput);
    const { accessToken: token } = await usersTestManager.login(
      user.login,
      createUserInput.password,
    );
    const comment = await commentsTestManager.createComment(
      { content: 'Some content for comment' },
      token,
      post.id,
    );

    await request(app.getHttpServer())
      .put(API_PREFIX + API_PATH.COMMENTS + `/${comment.id}/like-status`)
      .set('authorization', `Bearer ${token}`)
      .send({
        likeStatus: 'None',
      })
      .expect(HttpStatus.NO_CONTENT, {});

    const getResponse1 = await request(app.getHttpServer())
      .get(API_PREFIX + API_PATH.COMMENTS + `/${comment.id}`)
      // .set('Cookie', [refreshToken])
      .expect(HttpStatus.OK);

    expect(getResponse1.body).toEqual({
      ...comment,
      id: expect.any(String),
      createdAt: expect.any(String),
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: 'None',
      },
    });
  });

  it('should PUT None after Dislike comment successfully', async () => {
    const blog = await blogsTestManager.createBlog(createBlogInput);
    const post = await postsTestManager.createPost({
      ...createPostInput,
      blogId: blog.id,
    });
    const user = await usersTestManager.createUser(createUserInput);
    const { accessToken: token } = await usersTestManager.login(
      user.login,
      createUserInput.password,
    );
    const comment = await commentsTestManager.createComment(
      { content: 'Some content for comment' },
      token,
      post.id,
    );

    await request(app.getHttpServer())
      .put(API_PREFIX + API_PATH.COMMENTS + `/${comment.id}/like-status`)
      .set('authorization', `Bearer ${token}`)
      .send({
        likeStatus: 'Dislike',
      })
      .expect(HttpStatus.NO_CONTENT);

    const getResponse1 = await request(app.getHttpServer())
      .get(API_PREFIX + API_PATH.COMMENTS + `/${comment.id}`)
      .set('authorization', `Bearer ${token}`)
      // .set('Cookie', [refreshToken])
      .expect(HttpStatus.OK);

    expect(getResponse1.body).toEqual({
      ...comment,
      id: expect.any(String),
      createdAt: expect.any(String),
      likesInfo: {
        likesCount: 0,
        dislikesCount: 1,
        myStatus: 'Dislike',
      },
    });

    await request(app.getHttpServer())
      .put(API_PREFIX + API_PATH.COMMENTS + `/${comment.id}/like-status`)
      .set('authorization', `Bearer ${token}`)
      .send({
        likeStatus: 'None',
      })
      .expect(HttpStatus.NO_CONTENT);

    const getResponse2 = await request(app.getHttpServer())
      .get(API_PREFIX + API_PATH.COMMENTS + `/${comment.id}`)
      // .set('Cookie', [refreshToken])
      .set('authorization', `Bearer ${token}`)
      .expect(HttpStatus.OK);

    expect(getResponse2.body).toEqual({
      ...comment,
      id: expect.any(String),
      createdAt: expect.any(String),
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: 'None',
      },
    });
  });

  it('should PUT Like comment first user, but receive second user successfully', async () => {
    const blog = await blogsTestManager.createBlog(createBlogInput);
    const post = await postsTestManager.createPost({
      ...createPostInput,
      blogId: blog.id,
    });
    const userFirst = await usersTestManager.createUser(createUserInput);
    const { accessToken: token1 } = await usersTestManager.login(
      userFirst.login,
      createUserInput.password,
    );
    const comment = await commentsTestManager.createComment(
      { content: 'Some content for comment' },
      token1,
      post.id,
    );
    const userSecond = await usersTestManager.createUser({
      email: 'newuser@mail.com',
      login: 'newuser',
      password: '123456',
    });
    const { accessToken: token2 } = await usersTestManager.login(
      userSecond.login,
      '123456',
    );

    await request(app.getHttpServer())
      .put(API_PREFIX + API_PATH.COMMENTS + `/${comment.id}/like-status`)
      .set('authorization', `Bearer ${token1}`)
      .send({
        likeStatus: 'Like',
      })
      .expect(HttpStatus.NO_CONTENT, {});

    const getResponse1 = await request(app.getHttpServer())
      .get(API_PREFIX + API_PATH.COMMENTS + `/${comment.id}`)
      .set('authorization', `Bearer ${token2}`)
      // .set('Cookie', [refreshToken2])
      .expect(HttpStatus.OK);

    expect(getResponse1.body).toEqual({
      ...comment,
      id: expect.any(String),
      createdAt: expect.any(String),
      likesInfo: {
        likesCount: 1,
        dislikesCount: 0,
        myStatus: 'None',
      },
    });
  });

  it('should PUT Like comment first user, but second user Dislike successfully', async () => {
    const blog = await blogsTestManager.createBlog(createBlogInput);
    const post = await postsTestManager.createPost({
      ...createPostInput,
      blogId: blog.id,
    });
    const user = await usersTestManager.createUser(createUserInput);
    const { accessToken: token } = await usersTestManager.login(
      user.login,
      createUserInput.password,
    );
    const userSecond = await usersTestManager.createUser({
      email: 'newuser@mail.com',
      login: 'newuser',
      password: '123456',
    });
    const { accessToken: accessTokenSecond } = await usersTestManager.login(
      userSecond.login,
      '123456',
    );
    const comment = await commentsTestManager.createComment(
      { content: 'Some new comment created' },
      token,
      post.id,
    );

    await request(app.getHttpServer())
      .put(API_PREFIX + API_PATH.COMMENTS + `/${comment.id}/like-status`)
      .set('authorization', `Bearer ${token}`)
      // .set('Cookie', [refreshToken])
      .send({
        likeStatus: 'Like',
      })
      .expect(HttpStatus.NO_CONTENT);

    await request(app.getHttpServer())
      .put(API_PREFIX + API_PATH.COMMENTS + `/${comment.id}/like-status`)
      .set('authorization', `Bearer ${accessTokenSecond}`)
      .send({
        likeStatus: 'Dislike',
      })
      .expect(HttpStatus.NO_CONTENT);

    const getResponse1 = await request(app.getHttpServer())
      .get(API_PREFIX + API_PATH.COMMENTS + `/${comment.id}`)
      // .set('Cookie', [refreshTokenSecond])
      .set('authorization', `Bearer ${accessTokenSecond}`)
      .expect(HttpStatus.OK);

    expect(getResponse1.body).toEqual({
      ...comment,
      id: expect.any(String),
      createdAt: expect.any(String),
      likesInfo: {
        likesCount: 1,
        dislikesCount: 1,
        myStatus: 'Dislike',
      },
    });
  });
});
