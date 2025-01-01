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
import { ObjectId } from 'mongodb';
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

describe('Comments Negative (e2e)', () => {
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

  it('should return 400 while POST a comment with invalid post ID', async () => {
    const user = await usersTestManager.createUser(createUserInput);
    const { accessToken: token } = await usersTestManager.login(
      user.login,
      createUserInput.password,
    );

    const response = await request(app.getHttpServer())
      .post(`${API_PREFIX}${API_PATH.POSTS}/invalid${API_PATH.COMMENTS}`)
      .set('authorization', `Bearer ${token}`)
      .send({
        content: commentEntity.content,
      })
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

  it('should return 400 while GET comments from post with invalid post ID', async () => {
    // const user = await usersTestManager.createUser(createUserInput);
    // const { accessToken: token } = await usersTestManager.login(
    //   user.login,
    //   createUserInput.password,
    // );

    const response = await request(app.getHttpServer())
      .get(`${API_PREFIX}${API_PATH.POSTS}/invalid${API_PATH.COMMENTS}`)
      .send({
        content: commentEntity.content,
      })
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

  it('should return 400 while GET a comment with invalid commentId', async () => {
    // const token = await authTestManager.getTokenOfLoggedInUser();

    const response = await request(app.getHttpServer())
      .get(API_PREFIX + API_PATH.COMMENTS + `/invalidCommentId`)
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

  it('should return 400 while PUT a comment with invalid commentId', async () => {
    const user = await usersTestManager.createUser(createUserInput);
    const { accessToken: token } = await usersTestManager.login(
      user.login,
      createUserInput.password,
    );

    const response = await request(app.getHttpServer())
      .put(API_PREFIX + API_PATH.COMMENTS + `/invalidCommentId`)
      .set('authorization', `Bearer ${token}`)
      .send({ content: 'Some long comment that I try to send' })
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

  it('should return 400 while DELETE a comment with invalid commentId', async () => {
    const user = await usersTestManager.createUser(createUserInput);
    const { accessToken: token } = await usersTestManager.login(
      user.login,
      createUserInput.password,
    );

    const response = await request(app.getHttpServer())
      .delete(API_PREFIX + API_PATH.COMMENTS + `/invalidCommentId`)
      .set('authorization', `Bearer ${token}`)
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

  it('should return 404 while POST a comment with not existing post ID', async () => {
    const user = await usersTestManager.createUser(createUserInput);
    const { accessToken: token } = await usersTestManager.login(
      user.login,
      createUserInput.password,
    );
    const notExistingPostId = new ObjectId();

    await request(app.getHttpServer())
      .post(
        `${API_PREFIX}${API_PATH.POSTS}/${notExistingPostId}${API_PATH.COMMENTS}`,
      )
      .set('authorization', `Bearer ${token}`)
      .send({
        content: commentEntity.content,
      })
      .expect(HttpStatus.NOT_FOUND);
  });

  it('should return 404 while DELETE not existing comment', async () => {
    const user = await usersTestManager.createUser(createUserInput);
    const { accessToken: token } = await usersTestManager.login(
      user.login,
      createUserInput.password,
    );
    const notExistingCommentId = new ObjectId();

    await request(app.getHttpServer())
      .delete(API_PREFIX + API_PATH.COMMENTS + `/${notExistingCommentId}`)
      .set('authorization', `Bearer ${token}`)
      .expect(HttpStatus.NOT_FOUND);
  });

  it('should return 404 while PUT a comment with not existing commentId', async () => {
    const user = await usersTestManager.createUser(createUserInput);
    const { accessToken: token } = await usersTestManager.login(
      user.login,
      createUserInput.password,
    );
    const notExistingCommentId = new ObjectId();

    await request(app.getHttpServer())
      .put(API_PREFIX + API_PATH.COMMENTS + `/${notExistingCommentId}`)
      .set('authorization', `Bearer ${token}`)
      .send({ content: 'This is a content message that never will be sent' })
      .expect(HttpStatus.NOT_FOUND);
  });

  it('should return 403 while PUT not own comment', async () => {
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
    const someBodyElse = await usersTestManager.createUser({
      login: 'somebody',
      email: 'somebody@gmail.com',
      password: '123456',
    });
    const { accessToken: someBodyElseToken } = await usersTestManager.login(
      someBodyElse.login,
      '123456',
    );
    const comment = await commentsTestManager.createComment(
      { content: 'Somebody else long commentary to test' },
      someBodyElseToken,
      post.id,
    );

    await request(app.getHttpServer())
      .put(API_PREFIX + API_PATH.COMMENTS + `/${comment.id}`)
      .set('authorization', `Bearer ${token}`)
      .send({ content: 'This is a content message that never will be sent' })
      .expect(HttpStatus.FORBIDDEN);
  });

  it('should return 403 while DELETE not own comment', async () => {
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
    const someBodyElse = await usersTestManager.createUser({
      login: 'somebody',
      email: 'somebody@gmail.com',
      password: '123456',
    });
    const { accessToken: someBodyElseToken } = await usersTestManager.login(
      someBodyElse.login,
      '123456',
    );
    const comment = await commentsTestManager.createComment(
      { content: 'Somebody else long commentary to test' },
      someBodyElseToken,
      post.id,
    );

    await request(app.getHttpServer())
      .del(API_PREFIX + API_PATH.COMMENTS + `/${comment.id}`)
      .set('authorization', `Bearer ${token}`)
      .expect(HttpStatus.FORBIDDEN);
  });

  // it('should PUT None comment successfully', async () => {
  //   const blog = await blogsTestManager.createBlog();
  //   const post = await postsTestManager.createPost(blog.id);
  //   const token = await authTestManager.getTokenOfLoggedInUser();
  //   const comment = await commentsTestManager.createComment(post.id, token);
  //
  //   const response = await request(app.getHttpServer())
  //     .put(API_PREFIX + API_PATH.COMMENTS + `/${comment.id}/like-status`)
  //     .set('authorization', `Bearer ${token}`)
  //     .send({
  //       likeStatus: 'ERROR',
  //     })
  //     .expect(HttpStatus.BAD_REQUEST);
  //
  //   expect(response.body).toEqual({
  //     errorsMessages: [
  //       {
  //         field: 'likeStatus',
  //         message: 'Needs to be None, Like, Dislike',
  //       },
  //     ],
  //   });
  // });
});
