/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) return NextResponse.json({ error: "No se subió archivo" }, { status: 400 });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(new Uint8Array(arrayBuffer));

    // Convertimos a Base64 para evitar problemas de firma
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

    const result = await cloudinary.uploader.upload(base64, {
      folder: "inmuebles",
      resource_type: "auto",
    });

    return NextResponse.json({ url: result.secure_url });
  } catch (err: any) {
    console.error("🔥 Error en /api/upload:", err);
    return NextResponse.json({ error: err.message || "Error interno en la subida" }, { status: 500 });
  }
}
