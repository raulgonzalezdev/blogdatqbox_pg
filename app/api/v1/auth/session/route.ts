import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/auth";

export async function GET() {
  const cookieStore = cookies();
  const token = cookieStore.get("access_token");
  
  if (!token?.value) {
    return NextResponse.json({ error: "No hay sesión activa" }, { status: 401 });
  }
  
  try {
    const payload = await verifyJwt(token.value);
    if (!payload) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }
    
    return NextResponse.json({ 
      token: token.value,
      user: {
        id: payload.sub,
        role: payload.role
      }
    });
  } catch (error) {
    return NextResponse.json({ error: "Token inválido" }, { status: 401 });
  }
}

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
