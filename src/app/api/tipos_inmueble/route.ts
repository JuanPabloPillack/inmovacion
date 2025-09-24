// app/api/tipos_inmueble/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const tipos = await prisma.tipo_inmueble.findMany({
      select: {
        id_tipo_inmueble: true,
        nombre: true,
      },
      orderBy: {
        nombre: "asc",
      },
    });

    return NextResponse.json(tipos, { status: 200 });
  } catch (error) {
    console.error("Error al obtener tipos de inmueble:", error);
    return NextResponse.json(
      { error: "Error al obtener los tipos de inmueble" },
      { status: 500 }
    );
  }
}
