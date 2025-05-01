import 'dotenv/config';
import fastify from 'fastify';
import path from 'path';
import fs from 'fs';
import kafkaPlugin from './services/kafka';
import postRoutes from './routes/posts';

// Initialize the Fastify instance
const server = fastify({
  logger: true
});

// Initialize data directory if it doesn't exist
const DATA_DIR = path.join(__dirname, '..', 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Register Kafka
server.register(kafkaPlugin);

server.register(postRoutes);

// Run the server
const start = async (): Promise<void> => {
  try {
    const port = parseInt(process.env.PORT || '3000', 10);
    await server.listen({ port, host: '0.0.0.0' });
    const address = server.server.address();
    if (address && typeof address !== 'string') {
    console.log(`Server listening on ${address.port}`);
    } else {
    console.log(`Server started successfully`);
    }
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

// Start the server if this file is executed directly
if (require.main === module) {
  start();
}

export default server;