import { NextResponse } from "next/server";
import { PostsRepo } from "@/repositories/post.repository";
import { verifyJwt } from "@/lib/auth";
import { PostCreateSchema } from "@/lib/schemas";

function withCors(res: NextResponse) {
  res.headers.set("Access-Control-Allow-Origin", process.env.CORS_ORIGIN ?? "*");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.headers.set("Access-Control-Allow-Methods", "GET,PUT,DELETE,OPTIONS");
  return res;
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }));
}

export async function GET(_: Request, ctx: { params: { slug: string } }) {
  const post = await PostsRepo.bySlug(ctx.params.slug);
  
  if (!post) {
    return withCors(NextResponse.json({ error: "Not found" }, { status: 404 }));
  }
  
  return withCors(NextResponse.json(post, { status: 200 }));
}

export async function PUT(req: Request, ctx: { params: { slug: string } }) {
  try {
    const auth = req.headers.get("authorization");
    if (!auth?.startsWith("Bearer ")) {
      return withCors(NextResponse.json({ error: "Unauthorized" }, { status: 401 }));
    }
    
    const payload = await verifyJwt<{ sub: string; role: string }>(auth.split(" ")[1]);
    if (!payload?.sub) {
      return withCors(NextResponse.json({ error: "Unauthorized" }, { status: 401 }));
    }
    
    const json = await req.json();
    const parsed = PostCreateSchema.safeParse(json);
    
    if (!parsed.success) {
      return withCors(NextResponse.json({ 
        error: "Validation failed", 
        details: parsed.error.format() 
      }, { status: 400 }));
    }
    
    const updated = await PostsRepo.update(ctx.params.slug, {
      ...parsed.data,
      authorId: Number(payload.sub)
    });
    
    if (!updated) {
      return withCors(NextResponse.json({ error: "Post not found" }, { status: 404 }));
    }
    
    return withCors(NextResponse.json(updated, { status: 200 }));
  } catch {
    return withCors(NextResponse.json({ error: "Invalid token" }, { status: 401 }));
  }
}

export async function DELETE(req: Request, ctx: { params: { slug: string } }) {
  try {
    const auth = req.headers.get("authorization");
    if (!auth?.startsWith("Bearer ")) {
      return withCors(NextResponse.json({ error: "Unauthorized" }, { status: 401 }));
    }
    
    const payload = await verifyJwt<{ sub: string; role: string }>(auth.split(" ")[1]);
    if (!payload?.sub) {
      return withCors(NextResponse.json({ error: "Unauthorized" }, { status: 401 }));
    }
    
    const deleted = await PostsRepo.delete(ctx.params.slug, Number(payload.sub));
    
    if (!deleted) {
      return withCors(NextResponse.json({ error: "Post not found or unauthorized" }, { status: 404 }));
    }
    
    return withCors(NextResponse.json({ success: true }, { status: 200 }));
  } catch {
    return withCors(NextResponse.json({ error: "Invalid token" }, { status: 401 }));
  }
}
