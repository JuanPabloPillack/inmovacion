// =============================================================
// API: Obtener lista de tipos de cliente
// =============================================================

import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const tipos = await db.tipoCliente.findMany({
      orderBy: { nombre: "asc" },
    });

    return NextResponse.json(tipos, { status: 200 });
  } catch (error) {
    console.error("Error al cargar tipoCliente:", error);
    return NextResponse.json(
      { error: "Error al cargar los tipos de cliente" },
      { status: 500 }
    );
  }
}
