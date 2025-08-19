import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { access_token, expires_in } = await req.json();
  
  if (!access_token) {
    return NextResponse.json({ error: "Token requerido" }, { status: 400 });
  }
  
  const res = NextResponse.json({ ok: true });
  res.cookies.set("access_token", access_token, {
    httpOnly: true,
    path: "/",
    maxAge: Number(expires_in ?? 8 * 3600),
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  });
  
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set("access_token", "", {
    httpOnly: true,
    path: "/",
    maxAge: 0
  });
  
  return res;
}
