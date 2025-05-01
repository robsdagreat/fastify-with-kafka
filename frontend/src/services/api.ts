// Determine the correct API URL based on the environment
const getApiUrl = () => {
  // Use NEXT_PUBLIC_API_URL if defined (for Docker/internal calls)
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // Fallback for local development
  return typeof window !== 'undefined' 
    ? 'http://localhost:3000'  // Client-side
    : 'http://backend:3000';   // Server-side (Docker)
};

const apiUrl = getApiUrl();

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

// Enhanced fetch wrapper with error handling
const fetchWrapper = async <T>(url: string, options?: RequestInit): Promise<T> => {
  try {
    const response = await fetch(`${apiUrl}${url}`, options);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

export const fetchPosts = async (): Promise<Post[]> => {
  return fetchWrapper<Post[]>('/posts');
};

export const fetchPostById = async (id: string): Promise<Post> => {
  return fetchWrapper<Post>(`/posts/${id}`);
};

export const createPost = async (postData: CreatePostInput): Promise<Post> => {
  return fetchWrapper<Post>('/posts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(postData),
  });
};