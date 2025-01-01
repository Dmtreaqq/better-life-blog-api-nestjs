import { HttpStatus, INestApplication } from '@nestjs/common';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { BlogsTestManager } from '../../../helpers/blogs-test-manager';
import { PostsTestManager } from '../../../helpers/posts-test-manager';
import * as request from 'supertest';
import { API_PREFIX } from '../../../../src/settings/global-prefix.setup';
import { API_PATH } from '../../../../src/common/constants';
import {
  createBlogInput,
  createPostInput,
  createUserInput,
} from '../../../helpers/inputs';
import { UpdatePostInputDto } from '../../../../src/features/bloggers-platform/api/input-dto/update-post-input.dto';
import { ReactionStatus } from '../../../../src/features/bloggers-platform/api/enums/ReactionStatus';
import {
  basicAuthHeader,
  UsersTestManager,
} from '../../../helpers/users-test-manager';
import { initSettings } from '../../../helpers/init-settings';

describe('Posts Positive (e2e)', () => {
  let app: INestApplication;
  let mongoServer: MongoMemoryServer;
  let blogsTestManager: BlogsTestManager;
  let postsTestManager: PostsTestManager;
  let usersTestManager: UsersTestManager;

  beforeAll(async () => {
    const result = await initSettings();
    app = result.app;
    blogsTestManager = result.blogsTestManager;
    postsTestManager = result.postsTestManager;
    usersTestManager = result.usersTestManager;

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

  it('should POST a post successfully', async () => {
    const blog = await blogsTestManager.createBlog({
      name: 'name',
      description: 'desc',
      websiteUrl: 'https://google.com',
    });

    const response = await request(app.getHttpServer())
      .post(API_PREFIX + API_PATH.POSTS)
      .send({ ...createPostInput, blogId: blog.id })
      .set('authorization', basicAuthHeader)
      .expect(HttpStatus.CREATED);

    expect(response.body).toEqual({
      ...createPostInput,
      blogName: blog.name,
      blogId: blog.id,
      id: expect.any(String),
      createdAt: expect.any(String),
      extendedLikesInfo: {
        dislikesCount: 0,
        likesCount: 0,
        myStatus: ReactionStatus.None,
        newestLikes: [],
      },
    });
  });

  it('should GET created post successfully', async () => {
    const blog = await blogsTestManager.createBlog({
      name: 'name',
      description: 'desc',
      websiteUrl: 'https://google.com',
    });
    const post = await postsTestManager.createPost({
      title: 'post title',
      blogId: blog.id,
      content: 'cntn',
      shortDescription: 'desc',
    });

    const response = await request(app.getHttpServer())
      .get(`${API_PREFIX}${API_PATH.POSTS}/${post.id}`)
      .expect(HttpStatus.OK);

    expect(response.body).toEqual(post);
  });

  it('should GET post array including created post', async () => {
    const blog = await blogsTestManager.createBlog({
      name: 'name',
      description: 'desc',
      websiteUrl: 'https://google.com',
    });
    const post = await postsTestManager.createPost({
      title: 'post title',
      blogId: blog.id,
      content: 'cntn',
      shortDescription: 'desc',
    });

    const response = await request(app.getHttpServer())
      .get(`${API_PREFIX}${API_PATH.POSTS}`)
      .expect(HttpStatus.OK);

    expect(response.body).toEqual({
      items: expect.arrayContaining([post]),
      page: 1,
      pageSize: 10,
      pagesCount: 1,
      totalCount: 1,
    });
  });

  it('should PUT post successfully', async () => {
    const blog = await blogsTestManager.createBlog({
      name: 'name',
      description: 'desc',
      websiteUrl: 'https://google.com',
    });
    const post = await postsTestManager.createPost({
      title: 'post title',
      blogId: blog.id,
      content: 'cntn',
      shortDescription: 'desc',
    });

    const editedPostInput: UpdatePostInputDto = {
      blogId: blog.id,
      title: 'Doctor House',
      content: 'Video',
      shortDescription: 'TV series about a doctor House',
    };

    await request(app.getHttpServer())
      .put(`${API_PREFIX}${API_PATH.POSTS}/${post.id}`)
      .send(editedPostInput)
      .set('authorization', basicAuthHeader)
      .expect(HttpStatus.NO_CONTENT);

    const getResponse = await request(app.getHttpServer())
      .get(`${API_PREFIX}${API_PATH.POSTS}/${post.id}`)
      .expect(HttpStatus.OK);

    expect(getResponse.body).toEqual({
      ...post,
      ...editedPostInput,
    });
  });

  it('should DELETE post successfully', async () => {
    const blog = await blogsTestManager.createBlog({
      name: 'name',
      description: 'desc',
      websiteUrl: 'https://google.com',
    });
    const post = await postsTestManager.createPost({
      title: 'post title',
      blogId: blog.id,
      content: 'cntn',
      shortDescription: 'desc',
    });

    await request(app.getHttpServer())
      .delete(`${API_PREFIX}${API_PATH.POSTS}/${post.id}`)
      .set('authorization', basicAuthHeader)
      .expect(HttpStatus.NO_CONTENT);

    await request(app.getHttpServer())
      .get(`${API_PREFIX}${API_PATH.POSTS}/${post.id}`)
      .expect(HttpStatus.NOT_FOUND);
  });

  it('should GET posts using sorting', async () => {
    const blog = await blogsTestManager.createBlog({
      name: 'name',
      description: 'desc',
      websiteUrl: 'https://gog.com',
    });
    await postsTestManager.createPosts(blog.id, 5);

    const response1 = await request(app.getHttpServer())
      .get(`${API_PREFIX}${API_PATH.POSTS}/?sortBy=title&sortDirection=desc`)
      .expect(HttpStatus.OK);

    expect(response1.body.items[0].title).toEqual('postTitle4');

    const response2 = await request(app.getHttpServer())
      .get(`${API_PREFIX}${API_PATH.POSTS}/?sortBy=title&sortDirection=asc`)
      .expect(HttpStatus.OK);

    expect(response2.body.items[0].title).toEqual('postTitle0');
  });

  it('should GET posts using pagination', async () => {
    const blog = await blogsTestManager.createBlog({
      name: 'name',
      description: 'desc',
      websiteUrl: 'https://gog.com',
    });
    await postsTestManager.createPosts(blog.id, 5);

    const response1 = await request(app.getHttpServer())
      .get(`${API_PREFIX}${API_PATH.POSTS}/?pageSize=2`)
      .expect(HttpStatus.OK);

    expect(response1.body.items).toHaveLength(2);

    const response2 = await request(app.getHttpServer())
      .get(`${API_PREFIX}${API_PATH.POSTS}/?pageNumber=8&pageSize=2`)
      .expect(HttpStatus.OK);

    expect(response2.body.items).toHaveLength(0);
  });

  it('should PUT LIKE and DISLIKE post successfully', async () => {
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

    await request(app.getHttpServer())
      .put(API_PREFIX + API_PATH.POSTS + `/${post.id}/like-status`)
      .set('authorization', `Bearer ${token}`)
      .send({
        likeStatus: 'Like',
      })
      .expect(HttpStatus.NO_CONTENT);

    const getResponse1 = await request(app.getHttpServer())
      .get(API_PREFIX + API_PATH.POSTS + `/${post.id}`)
      .set('authorization', `Bearer ${token}`)
      .expect(HttpStatus.OK);

    expect(getResponse1.body).toEqual({
      ...post,
      id: expect.any(String),
      createdAt: expect.any(String),
      extendedLikesInfo: {
        likesCount: 1,
        dislikesCount: 0,
        myStatus: 'Like',
        newestLikes: [
          {
            addedAt: expect.any(String),
            login: createUserInput.login,
            userId: user.id,
          },
        ],
      },
    });
  });

  it('should PUT LIKES', async () => {
    // await request(app.getHttpServer().delete(`${API_PREFIX}${API_PATH.TESTING}/all-data`);
    const blog = await blogsTestManager.createBlog(createBlogInput);

    const post1 = await postsTestManager.createPost({
      ...createPostInput,
      blogId: blog.id,
    });
    const post2 = await postsTestManager.createPost({
      ...createPostInput,
      blogId: blog.id,
      title: 'Post 2',
    });
    const post3 = await postsTestManager.createPost({
      ...createPostInput,
      blogId: blog.id,
      title: 'Post 3',
    });
    const post4 = await postsTestManager.createPost({
      ...createPostInput,
      blogId: blog.id,
      title: 'Post 4',
    });
    const post5 = await postsTestManager.createPost({
      ...createPostInput,
      blogId: blog.id,
      title: 'Post 5',
    });
    const post6 = await postsTestManager.createPost({
      ...createPostInput,
      blogId: blog.id,
      title: 'Post 6',
    });

    const user1 = await usersTestManager.createUser(createUserInput);
    const user2 = await usersTestManager.createUser({
      email: 'user2@gmail.com',
      login: 'userlogin2',
      password: 'password',
    });
    const user3 = await usersTestManager.createUser({
      email: 'user3@gmail.com',
      login: 'userlogin3',
      password: 'password',
    });
    const user4 = await usersTestManager.createUser({
      email: 'user4@gmail.com',
      login: 'userlogin4',
      password: 'password',
    });
    const { accessToken: token1 } = await usersTestManager.login(
      user1.login,
      createUserInput.password,
    );
    const { accessToken: token2 } = await usersTestManager.login(
      user2.login,
      'password',
    );
    const { accessToken: token3 } = await usersTestManager.login(
      user3.login,
      'password',
    );
    const { accessToken: token4 } = await usersTestManager.login(
      user4.login,
      'password',
    );

    // like post 1 by user 1, user 2;
    await request(app.getHttpServer())
      .put(API_PREFIX + API_PATH.POSTS + `/${post1.id}/like-status`)
      .set('authorization', `Bearer ${token1}`)
      .send({
        likeStatus: 'Like',
      })
      .expect(HttpStatus.NO_CONTENT);

    await request(app.getHttpServer())
      .put(API_PREFIX + API_PATH.POSTS + `/${post1.id}/like-status`)
      .set('authorization', `Bearer ${token2}`)
      .send({
        likeStatus: 'Like',
      })
      .expect(HttpStatus.NO_CONTENT);

    // like post 2 by user 2, user 3;
    await request(app.getHttpServer())
      .put(API_PREFIX + API_PATH.POSTS + `/${post2.id}/like-status`)
      .set('authorization', `Bearer ${token2}`)
      .send({
        likeStatus: 'Like',
      })
      .expect(HttpStatus.NO_CONTENT);

    await request(app.getHttpServer())
      .put(API_PREFIX + API_PATH.POSTS + `/${post2.id}/like-status`)
      .set('authorization', `Bearer ${token3}`)
      .send({
        likeStatus: 'Like',
      })
      .expect(HttpStatus.NO_CONTENT);

    // dislike post3 by user1
    await request(app.getHttpServer())
      .put(API_PREFIX + API_PATH.POSTS + `/${post3.id}/like-status`)
      .set('authorization', `Bearer ${token1}`)
      .send({
        likeStatus: 'Dislike',
      })
      .expect(HttpStatus.NO_CONTENT);

    // likes post4 by user1, user4, user2, user3

    await request(app.getHttpServer())
      .put(API_PREFIX + API_PATH.POSTS + `/${post4.id}/like-status`)
      .set('authorization', `Bearer ${token1}`)
      .send({
        likeStatus: 'Like',
      })
      .expect(HttpStatus.NO_CONTENT);

    await request(app.getHttpServer())
      .put(API_PREFIX + API_PATH.POSTS + `/${post4.id}/like-status`)
      .set('authorization', `Bearer ${token4}`)
      .send({
        likeStatus: 'Like',
      })
      .expect(HttpStatus.NO_CONTENT);

    await request(app.getHttpServer())
      .put(API_PREFIX + API_PATH.POSTS + `/${post4.id}/like-status`)
      .set('authorization', `Bearer ${token2}`)
      .send({
        likeStatus: 'Like',
      })
      .expect(HttpStatus.NO_CONTENT);

    await request(app.getHttpServer())
      .put(API_PREFIX + API_PATH.POSTS + `/${post4.id}/like-status`)
      .set('authorization', `Bearer ${token3}`)
      .send({
        likeStatus: 'Like',
      })
      .expect(HttpStatus.NO_CONTENT);

    // like post 5 by user 2, dislike by user 3;

    await request(app.getHttpServer())
      .put(API_PREFIX + API_PATH.POSTS + `/${post5.id}/like-status`)
      .set('authorization', `Bearer ${token2}`)
      .send({
        likeStatus: 'Like',
      })
      .expect(HttpStatus.NO_CONTENT);

    await request(app.getHttpServer())
      .put(API_PREFIX + API_PATH.POSTS + `/${post5.id}/like-status`)
      .set('authorization', `Bearer ${token3}`)
      .send({
        likeStatus: 'Dislike',
      })
      .expect(HttpStatus.NO_CONTENT);

    // like post 6 by user 1, dislike by user 2.

    await request(app.getHttpServer())
      .put(API_PREFIX + API_PATH.POSTS + `/${post6.id}/like-status`)
      .set('authorization', `Bearer ${token1}`)
      .send({
        likeStatus: 'Like',
      })
      .expect(HttpStatus.NO_CONTENT);

    await request(app.getHttpServer())
      .put(API_PREFIX + API_PATH.POSTS + `/${post6.id}/like-status`)
      .set('authorization', `Bearer ${token2}`)
      .send({
        likeStatus: 'Dislike',
      })
      .expect(HttpStatus.NO_CONTENT);

    // Get the all posts by user1
    const getResponse1 = await request(app.getHttpServer())
      .get(API_PREFIX + API_PATH.POSTS)
      .set('authorization', `Bearer ${token1}`)
      .expect(HttpStatus.OK);

    expect(getResponse1.body).toEqual({
      items: [
        {
          ...post6,
          id: expect.any(String),
          createdAt: expect.any(String),
          extendedLikesInfo: {
            likesCount: 1,
            dislikesCount: 1,
            myStatus: 'Like',
            newestLikes: [
              {
                addedAt: expect.any(String),
                login: user1.login,
                userId: user1.id,
              },
            ],
          },
        },
        {
          ...post5,
          id: expect.any(String),
          createdAt: expect.any(String),
          extendedLikesInfo: {
            likesCount: 1,
            dislikesCount: 1,
            myStatus: 'None',
            newestLikes: [
              {
                addedAt: expect.any(String),
                login: user2.login,
                userId: user2.id,
              },
            ],
          },
        },
        {
          ...post4,
          id: expect.any(String),
          createdAt: expect.any(String),
          extendedLikesInfo: {
            likesCount: 4,
            dislikesCount: 0,
            myStatus: 'Like',
            newestLikes: [
              {
                addedAt: expect.any(String),
                login: user3.login,
                userId: user3.id,
              },
              {
                addedAt: expect.any(String),
                login: user2.login,
                userId: user2.id,
              },
              {
                addedAt: expect.any(String),
                login: user4.login,
                userId: user4.id,
              },
            ],
          },
        },
        {
          ...post3,
          id: expect.any(String),
          createdAt: expect.any(String),
          extendedLikesInfo: {
            likesCount: 0,
            dislikesCount: 1,
            myStatus: 'Dislike',
            newestLikes: [],
          },
        },
        {
          ...post2,
          id: expect.any(String),
          createdAt: expect.any(String),
          extendedLikesInfo: {
            likesCount: 2,
            dislikesCount: 0,
            myStatus: 'None',
            newestLikes: [
              {
                addedAt: expect.any(String),
                login: user3.login,
                userId: user3.id,
              },
              {
                addedAt: expect.any(String),
                login: user2.login,
                userId: user2.id,
              },
            ],
          },
        },
        {
          ...post1,
          id: expect.any(String),
          createdAt: expect.any(String),
          extendedLikesInfo: {
            likesCount: 2,
            dislikesCount: 0,
            myStatus: 'Like',
            newestLikes: [
              {
                addedAt: expect.any(String),
                login: user2.login,
                userId: user2.id,
              },
              {
                addedAt: expect.any(String),
                login: user1.login,
                userId: user1.id,
              },
            ],
          },
        },
      ],
      page: expect.any(Number),
      pageSize: expect.any(Number),
      pagesCount: expect.any(Number),
      totalCount: expect.any(Number),
    });
  });
});
