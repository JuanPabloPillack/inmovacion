// =============================================================
// src/app/api/proveedores/route.ts
// =============================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { proveedorSchema } from "@/lib/zod";

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = proveedorSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: parsed.error.issues[0].message
        },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const proveedor = await db.proveedor.create({
      data: {
        ...data,
        tipoServicioId: Number(data.tipoServicioId), // ← CONVERSIÓN AQUÍ
        estado: true,
      },
    });

    return NextResponse.json({ success: true, proveedor });

  } catch (err: any) {
    console.error("Error proveedor:", err);

    if (err.code === "P2002") {
      return NextResponse.json(
        {
          success: false,
          message: "Ya existe un proveedor con ese CUIT/CUIL"
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Error interno" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const proveedores = await db.proveedor.findMany({
    where: { estado: true },
    include: { tipoServicio: true },
    orderBy: { id_proveedor: "desc" },
  });

  return NextResponse.json(proveedores);
}
