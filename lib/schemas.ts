import { z } from "zod";
export const PostCreateSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  content: z.string().min(1)
});
export type PostCreate = z.infer<typeof PostCreateSchema>;
export const PostSchema = PostCreateSchema.extend({
  id: z.number(),
  authorId: z.number(),
  createdAt: z.string()
});
export const PostsPageSchema = z.object({ data: z.array(PostSchema), total: z.number() });
export const LoginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });
export const NewsletterSchema = z.object({ email: z.string().email() });
