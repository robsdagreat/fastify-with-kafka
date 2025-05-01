import { fetchPostById } from '@/services/api';
import Link from 'next/link';
import { Metadata } from 'next';

// Remove custom PageProps interface - let Next.js infer types
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const post = await fetchPostById(params.id);
  return {
    title: post.title,
    description: post.content.substring(0, 100),
  };
}

export default async function PostDetail({ params }: { params: { id: string } }) {
  const post = await fetchPostById(params.id);

  return (
    <div className="container mx-auto p-4">
      <Link href="/" className="btn btn-sm mb-4">
        Back to Posts
      </Link>
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h1 className="card-title text-3xl">{post.title}</h1>
          <p className="text-sm text-gray-500">
            By {post.author} • {new Date(post.createdAt).toLocaleDateString()}
          </p>
          <div className="divider"></div>
          <p className="whitespace-pre-line">{post.content}</p>
        </div>
      </div>
    </div>
  );
}