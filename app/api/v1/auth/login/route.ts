import { NextResponse } from "next/server";
import { LoginSchema } from "@/lib/schemas";
import bcrypt from "bcryptjs";
import { UsersRepo } from "@/repositories/user.repository";
import { signJwt } from "@/lib/auth";

export async function POST(req: Request) {
  const json = await req.json();
  const parsed = LoginSchema.safeParse(json);
  
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
  }
  
  const user = await UsersRepo.findByEmail(parsed.data.email);
  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
  
  const ok = await bcrypt.compare(parsed.data.password, user.password);
  if (!ok) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
  
  const token = await signJwt({ sub: String(user.id), role: user.role }, 8 * 3600);
  
  return NextResponse.json({
    access_token: token,
    token_type: "Bearer",
    expires_in: 8 * 3600
  });
}
