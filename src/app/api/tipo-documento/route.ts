// src/app/api/tipo-documentos/route.ts

import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const data = await db.tipoDocumento.findMany({
      orderBy: { nombre: "asc" },
    });
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Error cargando tipos de documento" },
      { status: 500 }
    );
  }
}
