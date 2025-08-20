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
    const { content, instructions, includeImages = false } = body;

    if (!content || !instructions) {
      return NextResponse.json({ 
        error: "El contenido y las instrucciones son requeridos" 
      }, { status: 400 });
    }

    // Mejorar contenido con OpenAI
    const improvedContent = await openaiService.improveContent(content, instructions, includeImages);

    return NextResponse.json({ content: improvedContent });
  } catch (error: any) {
    console.error("Error mejorando contenido:", error);
    return NextResponse.json(
      { error: error.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}
