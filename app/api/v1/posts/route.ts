import { NextResponse } from "next/server";
import { PostCreateSchema } from "@/lib/schemas";
import { verifyJwt } from "@/lib/auth";
import { PostsRepo } from "@/repositories/post.repository";

function withCors(res: NextResponse) {
  res.headers.set("Access-Control-Allow-Origin", process.env.CORS_ORIGIN ?? "*");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.headers.set("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS");
  return res;
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }));
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(Number(searchParams.get("limit") ?? "10"), 100);
  const offset = Number(searchParams.get("offset") ?? "0");
  
  const page = await PostsRepo.page(limit, offset);
  return withCors(NextResponse.json(page, { status: 200 }));
}

export async function POST(req: Request) {
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
    console.log("Received data:", json); // Para debug
    const parsed = PostCreateSchema.safeParse(json);
    
    if (!parsed.success) {
      console.log("Validation errors:", parsed.error.format()); // Para debug
      return withCors(NextResponse.json({ 
        error: "Validation failed", 
        details: parsed.error.format() 
      }, { status: 400 }));
    }
    
    const exists = await PostsRepo.existsSlug(parsed.data.slug);
    if (exists) {
      return withCors(NextResponse.json({ error: "Slug already exists" }, { status: 409 }));
    }
    
    const created = await PostsRepo.create({
      ...parsed.data,
      authorId: Number(payload.sub)
    });
    
    return withCors(NextResponse.json(created, { status: 201 }));
  } catch {
    return withCors(NextResponse.json({ error: "Invalid token" }, { status: 401 }));
  }
}
