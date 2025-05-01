import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Post, CreatePostInput } from '../types';

const POSTS_FILE = path.join(__dirname, '..', '..', 'data', 'posts.json');

// Helper function to read posts from file
async function readPosts(): Promise<Post[]> {
  try {
    const data = await fs.readFile(POSTS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading posts file:', error);
    return [];
  }
}

// Helper function to write posts to file
async function writePosts(posts: Post[]): Promise<void> {
  await fs.writeFile(POSTS_FILE, JSON.stringify(posts, null, 2), 'utf8');
}

// Post model
export class PostModel {
  // Get all posta
  static async getAll(): Promise<Post[]> {
    return await readPosts();
  }

  // Get post by ID
  static async getById(id: string): Promise<Post | undefined> {
    const posts = await readPosts();
    return posts.find(post => post.id === id);
  }

  // Create a new post
  static async create(postData: CreatePostInput): Promise<Post> {
    const posts = await readPosts();
    
    const newPost: Post = {
      id: uuidv4(),
      title: postData.title,
      content: postData.content,
      author: postData.author,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    posts.push(newPost);
    await writePosts(posts);
    
    return newPost;
  }

  static async clear(): Promise<void> {
    if (process.env.NODE_ENV === 'test') {
      // Clear test data implementation
      // For file-based storage:
      await fs.writeFile(POSTS_FILE, '[]', 'utf8');
    }
  }
}