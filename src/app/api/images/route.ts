import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { inmuebleId, url } = await req.json();

    if (!inmuebleId || !url) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
    }

    const imagen = await prisma.inmuebleImagen.create({
      data: { inmuebleId, url, principal: false },
    });

    return NextResponse.json(imagen, { status: 201 });
  } catch (error) {
    console.error("Error al guardar imagen:", error);
    return NextResponse.json({ error: "Error al guardar imagen" }, { status: 500 });
  }
}
