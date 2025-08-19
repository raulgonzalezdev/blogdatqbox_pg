import { fetchPostBySlug } from "@/lib/fetchers";

type Params = { params: { slug: string } };

export const revalidate = 60;

export default async function PostPage({ params }: Params) {
  const post = await fetchPostBySlug(params.slug);
  
  if (!post) {
    return (
      <main className="py-10">
        <h1 className="text-2xl font-semibold">No encontrado</h1>
      </main>
    );
  }

  return (
    <main className="py-10 max-w-prose">
      <h1 className="text-4xl font-semibold tracking-tight">{post.title}</h1>
      <p className="text-gray-500 mt-2">
        {new Date(post.createdAt).toLocaleDateString()}
      </p>
      <article className="prose mt-8 whitespace-pre-wrap">
        {post.content}
      </article>
    </main>
  );
}
