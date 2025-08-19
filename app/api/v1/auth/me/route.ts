import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/auth";
import { UsersRepo } from "@/repositories/user.repository";

export async function GET() {
  try {
    const token = (await cookies()).get("access_token")?.value;
    
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }
    
    const payload = await verifyJwt<{ sub: string; role: string }>(token);
    if (!payload?.sub) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    
    const user = await UsersRepo.findById(Number(payload.sub));
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    // No devolver la contraseña
    const { password, ...userWithoutPassword } = user;
    
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}
