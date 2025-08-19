import { HydrationBoundary } from "@tanstack/react-query";
import { makeQueryClient, prefetch, snapshot } from "@/lib/rquery";
import { fetchPostsPage } from "@/lib/fetchers";
import HomeClient from "./HomeClient";
import Hero from "@/components/Hero";
import NewsletterForm from "@/components/NewsletterForm";

export const revalidate = 60;

export default async function Home() {
  const qc = await makeQueryClient();
  await prefetch(qc, ["posts", { limit: 10, offset: 0 }], () => fetchPostsPage(10, 0));
  const state = await snapshot(qc);

  return (
    <main className="py-6">
      <Hero />
      <HydrationBoundary state={state}>
        <HomeClient />
      </HydrationBoundary>
      <NewsletterForm />
    </main>
  );
}
