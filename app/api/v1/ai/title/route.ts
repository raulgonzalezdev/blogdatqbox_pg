import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/auth";
import { openaiService } from "@/lib/openai";

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
    const { topic, includeImages = false } = body;

    if (!topic) {
      return NextResponse.json({ error: "El tema es requerido" }, { status: 400 });
    }

    // Generar título con OpenAI
    const title = await openaiService.generateTitle(topic, undefined, includeImages);

    return NextResponse.json({ title });
  } catch (error: any) {
    console.error("Error generando título:", error);
    return NextResponse.json(
      { error: error.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}
