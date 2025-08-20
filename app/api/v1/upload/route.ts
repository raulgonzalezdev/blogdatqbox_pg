import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

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

    // Verificar si es una solicitud de URL o archivo
    const contentType = request.headers.get("content-type");
    
    if (contentType?.includes("application/json")) {
      // Es una solicitud de URL
      const body = await request.json();
      const { url } = body;
      
      if (!url) {
        return NextResponse.json({ error: "No se proporcionó URL" }, { status: 400 });
      }

      // Validar que sea una URL de imagen válida
      try {
        new URL(url);
      } catch {
        return NextResponse.json({ error: "URL inválida" }, { status: 400 });
      }

      return NextResponse.json({ 
        success: true, 
        url: url,
        fileName: "external_image",
        size: 0,
        type: "image/external"
      });
    }

    // Es una solicitud de archivo
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No se proporcionó archivo" }, { status: 400 });
    }

    // Validar tipo de archivo
    const allowedTypes = [
      "image/jpeg",
      "image/png", 
      "image/gif",
      "image/webp",
      "application/pdf",
      "text/plain",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Tipo de archivo no permitido" }, { status: 400 });
    }

    // Validar tamaño (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: "Archivo demasiado grande" }, { status: 400 });
    }

    // Crear directorio de uploads si no existe
    const uploadsDir = join(process.cwd(), "public", "uploads");
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generar nombre único para el archivo
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const fileName = `${timestamp}_${originalName}`;
    const filePath = join(uploadsDir, fileName);

    // Convertir File a Buffer y guardar
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Devolver URL del archivo
    const fileUrl = `/uploads/${fileName}`;

    return NextResponse.json({ 
      success: true, 
      url: fileUrl,
      fileName: originalName,
      size: file.size,
      type: file.type
    });

  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
