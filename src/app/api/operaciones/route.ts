import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const operaciones = await db.operacion.findMany();
    return NextResponse.json(operaciones);
  } catch (err) {
    console.error("Error al obtener operaciones:", err);
    return NextResponse.json({ error: "Error al obtener operaciones" }, { status: 500 });
  }
}
