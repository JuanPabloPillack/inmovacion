/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET → listar inmuebles no archivados (para sección de módulo)
export async function GET() {
  try {
    const inmuebles = await prisma.inmueble.findMany({
      where: { archivado: false },
      include: {
        tipo_inmueble: true,
        estado: true,
        cliente: true,
        ubicacion: true,
        imagenes: true,
      },
    });
    return NextResponse.json(inmuebles);
  } catch (error) {
    console.error("Error al obtener inmuebles:", error);
    return NextResponse.json({ error: "Error al obtener inmuebles" }, { status: 500 });
  }
}

// PUT → actualizar inmueble (solo para archivar)
export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get("id");
    if (!idParam) return NextResponse.json({ error: "ID faltante" }, { status: 400 });
    const id = Number(idParam);
    if (isNaN(id)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

    const body = await req.json();

    const inmueble = await prisma.inmueble.update({
      where: { id_inmueble: id },
      data: { archivado: body.archivado ?? false },
    });

    return NextResponse.json(inmueble);
  } catch (error) {
    console.error("Error al actualizar inmueble:", error);
    return NextResponse.json({ error: "Error al actualizar inmueble" }, { status: 500 });
  }
}
