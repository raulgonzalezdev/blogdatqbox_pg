import { PostsPageSchema, PostSchema } from "@/lib/schemas";
export async function fetchPostsPage(limit=10, offset=0) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/posts?limit=${limit}&offset=${offset}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Error cargando posts");
  const json = await res.json();
  return PostsPageSchema.parse(json);
}
export async function fetchPostBySlug(slug: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/posts/${slug}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Error cargando post");
  const json = await res.json();
  return PostSchema.parse(json);
}
