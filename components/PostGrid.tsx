import { PostCard } from "./PostCard";

export default function PostGrid({ posts }: { posts: { id: number; title: string; slug: string; createdAt: string; content: string }[] }) {
  return (
    <section className="mt-8 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {posts.map(p => <PostCard key={p.id} post={p} />)}
    </section>
  );
}
