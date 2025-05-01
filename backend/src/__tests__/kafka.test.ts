import { Kafka, Producer, Admin } from 'kafkajs';
import fastify, { FastifyInstance } from 'fastify';
import kafkaPlugin from '../services/kafka';
import { Post } from '../types';
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';

// Mock the entire kafkajs module
jest.mock('kafkajs');

describe('Kafka Integration', () => {
  let mockProducer: {
    send: jest.Mock;
    connect: jest.Mock;
    disconnect?: jest.Mock;
  };

  let app: FastifyInstance;
  let post: Post;

  beforeEach(async () => {
    mockProducer = {
      send: jest.fn(() => Promise.resolve()),
      connect: jest.fn(() => Promise.resolve()),
    };
    
    // Mock Kafka implementation
    (Kafka as jest.Mock).mockImplementation(() => ({
      producer: () => mockProducer,
      admin: () => ({
        connect: () => Promise.resolve(),
        disconnect: () => Promise.resolve(),
        listTopics: () => Promise.resolve([])
      }),
      logger: () => {},
      consumer: () => {}
    }));

    app = fastify();
    await app.register(kafkaPlugin, {
      mockProducer: mockProducer as unknown as Producer
    });

    post = {
      id: 'test-id',
      title: 'Test Post',
      content: 'Test Content',
      author: 'Test Author',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  });

  afterEach(async () => {
    await app.close();
  });

  it('should send post_created event', async () => {
    await app.kafka.sendPostCreatedEvent(post);

    expect(mockProducer.connect).toHaveBeenCalled();
    expect(mockProducer.send).toHaveBeenCalledWith({
      topic: 'posts',
      messages: [{
        key: post.id,
        value: JSON.stringify({
          id: post.id,
          title: post.title,
          author: post.author,
          createdAt: post.createdAt,
          eventType: 'post.created'
        })
      }]
    });
  });

  it('should handle send errors', async () => {
    mockProducer.send.mockImplementationOnce(() => {
      throw new Error('Kafka error');
    });

    await expect(app.kafka.sendPostCreatedEvent(post)).rejects.toThrow('Kafka error');
  });
});