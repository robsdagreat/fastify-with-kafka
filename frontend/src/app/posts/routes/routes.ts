export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const res = await fetch('http://backend:3000/posts');
    return new Response(JSON.stringify(await res.json()), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}