import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (isNaN(id)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    // 🔹 Primero obtenemos el inmueble
    const inmueble = await db.inmueble.findUnique({
      where: { id_inmueble: id },
    });

    if (!inmueble) {
      return NextResponse.json({ error: "Inmueble no encontrado" }, { status: 404 });
    }

    // 🔹 Cambiamos el valor de archivado al contrario
    const actualizado = await db.inmueble.update({
      where: { id_inmueble: id },
      data: { archivado: !inmueble.archivado },
    });

    return NextResponse.json(actualizado);
  } catch (error) {
    console.error("❌ Error en PUT /api/inmuebles/[id]/archivar:", error);
    return NextResponse.json(
      { error: "Error al actualizar el inmueble" },
      { status: 500 }
    );
  }
}
