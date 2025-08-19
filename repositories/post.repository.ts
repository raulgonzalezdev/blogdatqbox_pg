import { prisma } from "@/lib/db";

export const PostsRepo = {
  page: async (limit: number, offset: number) => {
    const [data, total] = await Promise.all([
      prisma.post.findMany({
        take: limit,
        skip: offset,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          slug: true,
          content: true,
          authorId: true,
          createdAt: true
        }
      }),
      prisma.post.count()
    ]);
    return { data, total };
  },
  
  bySlug: (slug: string) => prisma.post.findUnique({
    where: { slug },
    select: {
      id: true,
      title: true,
      slug: true,
      content: true,
      authorId: true,
      createdAt: true
    }
  }),
  
  create: (data: { title: string; slug: string; content: string; authorId: number }) => 
    prisma.post.create({ data }),
  
  existsSlug: (slug: string) => 
    prisma.post.findUnique({ where: { slug }, select: { id: true } })
      .then(x => Boolean(x)),
  
  update: async (slug: string, data: { title: string; slug: string; content: string; authorId: number }) => {
    const existing = await prisma.post.findUnique({ where: { slug } });
    if (!existing || existing.authorId !== data.authorId) {
      return null;
    }
    
    return prisma.post.update({
      where: { slug },
      data: { title: data.title, slug: data.slug, content: data.content },
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        authorId: true,
        createdAt: true
      }
    });
  },
  
  delete: async (slug: string, authorId: number) => {
    const existing = await prisma.post.findUnique({ where: { slug } });
    if (!existing || existing.authorId !== authorId) {
      return false;
    }
    
    await prisma.post.delete({ where: { slug } });
    return true;
  }
};
