import { Producer, Consumer } from 'kafkajs';

// Post-related types
export interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostInput {
  title: string;
  content: string;
  author: string;
}

// Any additional shared types can be defined here
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Add this to augment the FastifyInstance type
declare module 'fastify' {
  interface FastifyInstance {
    kafka: {
      producer: Producer;
      consumer?: Consumer; // Make consumer optional since it's not always used
      sendMessage: (topic: string, messages: any) => Promise<void>;
      sendPostCreatedEvent: (post: Post) => Promise<void>;
    };
  }
}