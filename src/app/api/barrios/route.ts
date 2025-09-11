/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/barrios/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const barrios = await prisma.barrio.findMany({
      orderBy: { nombre: "asc" },
    });

    return NextResponse.json(barrios, { status: 200 });
  } catch (error: any) {
    console.error("❌ Error GET barrios:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
