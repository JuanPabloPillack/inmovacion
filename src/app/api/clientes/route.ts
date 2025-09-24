import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const clientes = await prisma.cliente.findMany({
      select: { id_cliente: true, nombre: true },
      orderBy: { nombre: "asc" },
    });

    return NextResponse.json(clientes);
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    return NextResponse.json({ error: "Error al obtener clientes" }, { status: 500 });
  }
}
