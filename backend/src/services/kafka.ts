import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { Kafka, Producer, Admin } from 'kafkajs';
import { Post } from '../types';

interface KafkaPluginOptions {
  connectionTimeout?: number;
  mockProducer?: Producer; // For testing
}

const kafkaPlugin: FastifyPluginAsync<KafkaPluginOptions> = async (fastify, options) => {
  const kafkaBroker = process.env.KAFKA_BROKER || 'localhost:9092';
  fastify.log.info(`Connecting to Kafka broker at ${kafkaBroker}`);

  // Allow injection of mock producer for testing
  let producer: Producer;
  let admin: Admin;

  if (options.mockProducer) {
    // Use mock producer if provided (for tests)
    producer = options.mockProducer;
    fastify.log.info('Using mock Kafka producer');
  } else {
    // Create real Kafka instance
    const kafka = new Kafka({
      clientId: 'post-service',
      brokers: [kafkaBroker],
      connectionTimeout: options.connectionTimeout || 5000,
      retry: {
        initialRetryTime: 1000,
        retries: 3,
        maxRetryTime: 3000
      }
    });

    producer = kafka.producer();
    admin = kafka.admin();
  }

  const checkKafkaConnection = async () => {
    try {
      if (admin) {
        await admin.connect();
        await admin.listTopics();
        await admin.disconnect();
      }
      return true;
    } catch (error) {
      fastify.log.error('Kafka health check failed', error);
      return false;
    }
  };

  const sendPostCreatedEvent = async (post: Post) => {
    const message = {
      key: post.id,
      value: JSON.stringify({
        id: post.id,
        title: post.title,
        author: post.author,
        createdAt: post.createdAt,
        eventType: 'post.created'
      })
    };

    await producer.send({
      topic: 'posts',
      messages: [message]
    });
    fastify.log.info(`Post created event sent for post ${post.id}`);
  };

  try {
    if (!options.mockProducer) {
      // Only connect real producer in non-test environments
      const connectionPromise = producer.connect();
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Kafka connection timeout')), 
          options.connectionTimeout || 5000);
      });
      
      await Promise.race([connectionPromise, timeoutPromise]);
      fastify.log.info('Successfully connected to Kafka');
    }

    // Decorate fastify instance
    fastify.decorate('kafka', {
      producer,
      sendMessage: async (topic: string, messages: any) => {
        try {
          await producer.send({
            topic,
            messages: Array.isArray(messages) ? messages : [{ value: JSON.stringify(messages) }]
          });
        } catch (error) {
          fastify.log.error(`Failed to send message to Kafka topic ${topic}`, error);
          throw error;
        }
      },
      sendPostCreatedEvent,
      checkConnection: checkKafkaConnection
    });

    fastify.addHook('onClose', async () => {
      fastify.log.info('Disconnecting from Kafka');
      try {
        await producer.disconnect();
        if (admin) await admin.disconnect();
      } catch (error) {
        fastify.log.error('Error disconnecting from Kafka', error);
      }
    });

  } catch (error) {
    fastify.log.error('Failed to connect to Kafka', error);
    
    fastify.decorate('kafka', {
      producer: null as unknown as Producer,
      sendMessage: async () => {
        fastify.log.warn('Attempted to send message but Kafka is not connected');
      },
      sendPostCreatedEvent: async () => {
        fastify.log.warn('Attempted to send post event but Kafka is not connected');
      },
      checkConnection: async () => false
    });
    
    fastify.log.warn('Service started without Kafka connection');
  }
};

export default fp(kafkaPlugin, {
  name: 'kafka',
  fastify: '4.x',
  dependencies: []
});

// Export types for testing
export type { KafkaPluginOptions };
export type KafkaPlugin = typeof kafkaPlugin;