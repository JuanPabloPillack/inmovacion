import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json();
  const { inmuebleId, url } = body;

  if (!inmuebleId || !url) {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
  }

  const imagen = await prisma.inmuebleImagen.create({
    data: { inmuebleId, url },
  });

  return NextResponse.json(imagen);
}
