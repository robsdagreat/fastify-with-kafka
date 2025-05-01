import { Post } from '@/services/api';
import Link from 'next/link';

export default async function Home() {
  // Change Post to Post[] since we expect an array
  const posts: Post[] = await fetch('/api/posts').then(res => res.json());

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Blog Posts</h1>
      <Link href="/posts/new" className="btn btn-primary mb-4">
        Create New Post
      </Link>
      <div className="grid gap-4">
        {/* Remove the Post type from post parameter since posts is already typed as Post[] */}
        {posts.map((post) => (
          <div key={post.id} className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">{post.title}</h2>
              <p>By {post.author}</p>
              <div className="card-actions justify-end">
                <Link href={`/posts/${post.id}`} className="btn btn-sm btn-outline">
                  View Details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

export const dynamic = 'force-dynamic';