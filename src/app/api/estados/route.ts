import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const estados = await prisma.estado.findMany({
      select: {
        id_estado: true,
        nombre: true,
      },
      orderBy: { nombre: "asc" },
    });

    return NextResponse.json(estados);
  } catch (error) {
    console.error("Error al obtener estados:", error);
    return NextResponse.json(
      { error: "Error al obtener estados" },
      { status: 500 }
    );
  }
}
