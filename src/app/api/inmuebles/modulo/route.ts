/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// ✅ GET → listar todos los inmuebles (activos y archivados)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const mostrarArchivados = searchParams.get("archivados");

    const where: any = {};

    // 🔸 Si se envía ?archivados=true, muestra solo los archivados
    if (mostrarArchivados === "true") {
      where.archivado = true;
    }

    const inmuebles = await db.inmueble.findMany({
      where,
      include: {
        tipo_inmueble: true,
        estado: true,
        cliente: true,
        ubicacion: {
          include: { barrio: { include: { localidad: true } } },
        },
        imagenes: true,
      },
      orderBy: { id_inmueble: "desc" },
    });

    return NextResponse.json(inmuebles);
  } catch (error) {
    console.error("❌ Error al obtener inmuebles:", error);
    return NextResponse.json({ error: "Error al obtener inmuebles" }, { status: 500 });
  }
}

// ✅ PUT → actualizar estado de archivado
export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get("id");
    if (!idParam) {
      return NextResponse.json({ error: "ID faltante" }, { status: 400 });
    }

    const id = Number(idParam);
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const body = await req.json();

    const inmueble = await db.inmueble.update({
      where: { id_inmueble: id },
      data: { archivado: Boolean(body.archivado) },
    });

    return NextResponse.json(inmueble);
  } catch (error) {
    console.error("❌ Error al actualizar inmueble:", error);
    return NextResponse.json({ error: "Error al actualizar inmueble" }, { status: 500 });
  }
}
