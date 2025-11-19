// src/app/api/tipos-servicio/route.ts

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const tipos = await db.tipoServicio.findMany({
      orderBy: { nombre: "asc" },
    });

    return NextResponse.json(tipos);
  } catch (error) {
    console.error("Error cargando tipos de servicio:", error);
    return NextResponse.json(
      { error: "Error al obtener tipos de servicio" },
      { status: 500 }
    );
  }
}