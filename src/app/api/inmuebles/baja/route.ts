import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ✅ GET → listar todos los inmuebles, para gestión de baja
export async function GET() {
  try {
    const inmuebles = await prisma.inmueble.findMany({
      include: {
        tipo_inmueble: true,
        estado: true,
        operacion: true,
        cliente: true,
        ubicacion: true,
        imagenes: true,
      },
    });

    return NextResponse.json(inmuebles);
  } catch (error) {
    console.error("❌ Error en GET /api/inmuebles/baja:", error);
    return NextResponse.json({ error: "Error al obtener inmuebles" }, { status: 500 });
  }
}

// ✅ PUT → archivar/desarchivar inmueble
export async function PUT(req: NextRequest) {
  try {
    const { id_inmueble, archivado } = await req.json();

    if (id_inmueble == null || typeof archivado !== "boolean") {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    const inmuebleActualizado = await prisma.inmueble.update({
      where: { id_inmueble },
      data: { archivado },
    });

    return NextResponse.json(inmuebleActualizado);
  } catch (error) {
    console.error("❌ Error en PUT /api/inmuebles/baja:", error);
    return NextResponse.json({ error: "Error al actualizar inmueble" }, { status: 500 });
  }
}
