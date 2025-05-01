// jest.setup.ts
import { PostModel } from './src/models/post';
import { beforeEach } from 'node:test';

beforeEach(async () => {
  await PostModel.clear();
});