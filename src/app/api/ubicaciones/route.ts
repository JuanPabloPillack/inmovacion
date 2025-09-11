/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { direccion, ciudad, provincia, id_barrio } = body;

    if (!direccion || !id_barrio) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
    }

    const ubicacion = await prisma.ubicacion.create({
      data: {
        direccion,
        ciudad: ciudad || null,
        provincia: provincia || null,
        id_barrio,
      },
    });

    return NextResponse.json(ubicacion, { status: 201 });
  } catch (error: any) {
    console.error("❌ Error POST ubicación:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const ubicaciones = await prisma.ubicacion.findMany({
      include: { barrio: true },
      orderBy: { id_ubicacion: "desc" },
    });
    return NextResponse.json(ubicaciones, { status: 200 });
  } catch (error: any) {
    console.error("❌ Error GET ubicaciones:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
