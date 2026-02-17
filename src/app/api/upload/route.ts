// src/app/api/upload/route.ts

/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// ⚠️ Configurar Cloudinary correctamente
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No se recibió archivo" },
        { status: 400 }
      );
    }

    // Validación extra
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "El archivo no es una imagen" },
        { status: 400 }
      );
    }

    // Convertir a buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Subir a Cloudinary usando stream
    const uploadResult = await new Promise<any>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "inmuebles",
          resource_type: "image",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      stream.end(buffer);
    });

    if (!uploadResult?.secure_url) {
      throw new Error("Cloudinary no devolvió secure_url");
    }

    // ✅ DEVOLVER URL REAL
    return NextResponse.json(
      {
        url: uploadResult.secure_url,
        public_id: uploadResult.public_id,
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("❌ Error subiendo a Cloudinary:", error);

    return NextResponse.json(
      {
        error: "Error al subir imagen",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
