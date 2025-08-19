import { prisma } from "@/lib/db";

export const SubscriptionsRepo = {
  create: (email: string) => prisma.subscription.create({ data: { email } })
};
