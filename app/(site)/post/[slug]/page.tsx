import { fetchPostBySlug } from "@/lib/fetchers";
import PostContent from "@/components/PostContent";
import PostActions from "@/components/PostActions";
import BackButton from "@/components/BackButton";

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
      <div className="mb-6">
        <BackButton />
      </div>
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <h1 className="text-4xl font-semibold tracking-tight">{post.title}</h1>
          <p className="text-gray-500 mt-2">
            {new Date(post.createdAt).toLocaleDateString()}
          </p>
        </div>
        <PostActions postId={post.id} slug={post.slug} authorId={post.authorId} />
      </div>
      <PostContent content={post.content} />
    </main>
  );
}
