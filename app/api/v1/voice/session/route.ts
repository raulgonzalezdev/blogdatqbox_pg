import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/auth";
import { realtimeService } from "@/lib/realtime";

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const token = (await cookies()).get("access_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const payload = await verifyJwt<{ sub: string; role: string }>(token);
    if (!payload?.sub) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    const body = await request.json();
    const { model = 'gpt-4o-realtime-preview-2025-06-03' } = body;

    // Crear sesión de voz
    const session = await realtimeService.createSession(model);

    return NextResponse.json(session);
  } catch (error: any) {
    console.error("Error creando sesión de voz:", error);
    return NextResponse.json(
      { error: error.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}
