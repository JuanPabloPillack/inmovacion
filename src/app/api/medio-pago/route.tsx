// ===============================================
// API: Medios de Pago (solo GET por ahora)
// Ruta: /api/medio-pago
// ===============================================

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const medios = await db.medioPago.findMany({
      orderBy: { nombre: "asc" },
    });

    return NextResponse.json(medios);
  } catch (error) {
    console.error("Error cargando medios de pago:", error);
    return NextResponse.json(
      { error: "Error al obtener medios de pago" },
      { status: 500 }
    );
  }
}
