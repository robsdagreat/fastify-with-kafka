import app from '../app';
import supertest from 'supertest';
import { PostModel } from '../models/post';
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';

// Extend PostModel type for testing
declare module '../models/post' {
  interface PostModelClass {
    clear(): Promise<void>;
  }
}

describe('Post Service', () => {
  beforeAll(async () => {
    await app.ready();
    // Add clear method to PostModel for tests
    (PostModel as any).clear = async () => {
      // Implementation for clearing test data
    };
  });

  afterAll(async () => {
    await (PostModel as any).clear();
    await app.close();
  });

  describe('POST /posts', () => {
    it('should create a new post', async () => {
      const response = await supertest(app.server)
        .post('/posts')
        .send({
          title: 'Test Post',
          content: 'Test Content',
          author: 'Test Author'
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe('Test Post');
    });
  });

  describe('GET /posts', () => {
    it('should return all posts', async () => {
      await PostModel.create({
        title: 'Test 1',
        content: 'Content 1',
        author: 'Author 1'
      });

      const response = await supertest(app.server)
        .get('/posts')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /posts/:id', () => {
    it('should return a specific post', async () => {
      const post = await PostModel.create({
        title: 'Test 2',
        content: 'Content 2',
        author: 'Author 2'
      });

      const response = await supertest(app.server)
        .get(`/posts/${post.id}`)
        .expect(200);

      expect(response.body.id).toBe(post.id);
    });

    it('should return 404 for non-existent post', async () => {
      await supertest(app.server)
        .get('/posts/non-existent-id')
        .expect(404);
    });
  });
});