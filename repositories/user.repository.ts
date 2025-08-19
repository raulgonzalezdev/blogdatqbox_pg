import { prisma } from "@/lib/db";

export const UsersRepo = {
  findByEmail: (email: string) => prisma.user.findUnique({ where: { email } }),
  findById: (id: number) => prisma.user.findUnique({ where: { id } }),
  create: (data: { email: string; password: string; name: string; role?: string }) => 
    prisma.user.create({ data })
};
