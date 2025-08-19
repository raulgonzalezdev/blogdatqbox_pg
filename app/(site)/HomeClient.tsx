"use client";
import { useQuery } from "@tanstack/react-query";
import { fetchPostsPage } from "@/lib/fetchers";
import PostGrid from "@/components/PostGrid";

export default function HomeClient() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["posts", { limit: 10, offset: 0 }],
    queryFn: () => fetchPostsPage(10, 0)
  });

  if (isLoading) return <p className="mt-8">Cargando…</p>;
  if (error) return <p className="mt-8 text-red-600">Error cargando posts</p>;
  
  return <PostGrid posts={data!.data} />;
}
