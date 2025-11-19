// ===============================================
// API: Estados de Pago (solo GET por ahora)
// Ruta: /api/estado-pago
// ===============================================
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const estados = await db.estadoPago.findMany({
      orderBy: { nombre: "asc" },
    });

    return NextResponse.json(estados);
  } catch (error) {
    console.error("Error cargando estados de pago:", error);
    return NextResponse.json(
      { error: "Error al obtener estados de pago" },
      { status: 500 }
    );
  }
}
