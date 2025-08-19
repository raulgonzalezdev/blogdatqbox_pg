import { NextResponse } from "next/server";
import { NewsletterSchema } from "@/lib/schemas";
import { SubscriptionsRepo } from "@/repositories/subscription.repository";

function withCors(res: NextResponse) {
  res.headers.set("Access-Control-Allow-Origin", process.env.CORS_ORIGIN ?? "*");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.headers.set("Access-Control-Allow-Methods", "POST,OPTIONS");
  return res;
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }));
}

export async function POST(req: Request) {
  const json = await req.json().catch(() => ({}));
  const parsed = NewsletterSchema.safeParse(json);
  
  if (!parsed.success) {
    return withCors(NextResponse.json({ error: parsed.error.format() }, { status: 400 }));
  }
  
  try {
    await SubscriptionsRepo.create(parsed.data.email);
    return withCors(NextResponse.json({ ok: true }, { status: 201 }));
  } catch {
    return withCors(NextResponse.json({ error: "Already subscribed?" }, { status: 409 }));
  }
}
