import { FastifyPluginAsync } from 'fastify';
import { PostModel } from '../models/post';
import { CreatePostInput } from '../types';

const postRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /posts - Get all posts
  fastify.get('/posts', async () => {
    return await PostModel.getAll();
  });

  // Get post by ID
  fastify.get<{
    Params: { id: string }
  }>('/posts/:id', async (request, reply) => {
    const { id } = request.params;
    const post = await PostModel.getById(id);
    
    if (!post) {
      reply.code(404);
      return { error: 'Post not found' };
    }
    
    return post;
  });

  // Create a new post
  fastify.post<{
    Body: CreatePostInput
  }>('/posts', {
    schema: {
      body: {
        type: 'object',
        required: ['title', 'content', 'author'],
        properties: {
          title: { type: 'string' },
          content: { type: 'string' },
          author: { type: 'string' }
        }
      }
    }
  }, async (request, reply) => {
    const { title, content, author } = request.body;
    
    const post = await PostModel.create({ title, content, author });
    
    // Send Kafka event
    await fastify.kafka.sendPostCreatedEvent(post);
    
    reply.code(201);
    return post;
  },
);
};



export default postRoutes;