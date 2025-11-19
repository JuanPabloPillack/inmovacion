/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// ✅ GET → listar inmuebles (activos, archivados o todos)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const mostrarArchivados = searchParams.get("archivados");

    const where: any = {};

    // 🔸 Controla qué mostrar según el parámetro ?archivados=
    if (mostrarArchivados === "true") {
      where.archivado = true;
    } else if (mostrarArchivados === "false") {
      where.archivado = false;
    }
    // Si no se pasa el parámetro, muestra todos (archivados + activos)

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
    return NextResponse.json(
      { error: "Error al obtener inmuebles" },
      { status: 500 }
    );
  }
}

// ✅ PUT → actualizar el estado de archivado o sincronizar con estado
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

    // 🔸 Verificamos si se envía un nuevo estado
    let archivado = body.archivado;

    if (body.id_estado) {
      const estado = await db.estado.findUnique({
        where: { id_estado: Number(body.id_estado) },
        select: { nombre: true },
      });

      // Si el estado no es "disponible", se archiva automáticamente
      if (estado && estado.nombre.toLowerCase() !== "disponible") {
        archivado = true;
      } else if (estado && estado.nombre.toLowerCase() === "disponible") {
        archivado = false;
      }
    }

    const inmueble = await db.inmueble.update({
      where: { id_inmueble: id },
      data: {
        ...body,
        archivado,
      },
    });

    return NextResponse.json(inmueble);
  } catch (error) {
    console.error("❌ Error al actualizar inmueble:", error);
    return NextResponse.json(
      { error: "Error al actualizar inmueble" },
      { status: 500 }
    );
  }
}
