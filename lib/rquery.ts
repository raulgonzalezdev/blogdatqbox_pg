"use server";
import { DehydratedState, QueryClient, dehydrate } from "@tanstack/react-query";

export async function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        refetchOnWindowFocus: false,
        retry: 1
      }
    }
  });
}

export async function prefetch<T>(qc: QueryClient, key: unknown[], fn: () => Promise<T>) {
  await qc.prefetchQuery({ queryKey: key, queryFn: fn });
}

export async function snapshot(qc: QueryClient): Promise<DehydratedState> {
  return dehydrate(qc);
}
