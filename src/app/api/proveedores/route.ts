/* eslint-disable @typescript-eslint/no-explicit-any */
// ===============================================
// API: Crear y listar Proveedores
// Ruta: /api/proveedores
// Runtime Node.js
// ===============================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// =========================
// POST — Crear proveedor
// =========================
export async function POST(req: NextRequest) {
  try {
    const data = await req.json().catch(() => null);

    if (!data) {
      return NextResponse.json(
        { success: false, message: "Body inválido" },
        { status: 400 }
      );
    }

    const tipoServicioId = Number(data.tipoServicioId);
    if (isNaN(tipoServicioId)) {
      return NextResponse.json(
        { success: false, message: "tipoServicioId inválido" },
        { status: 400 }
      );
    }

    // Crear proveedor
    const proveedor = await db.proveedor.create({
      data: {
        nombre_razon_social: data.nombre_razon_social,
        cuit_cuil: data.cuit_cuil,
        correo_contacto: data.correo_contacto || null,
        telefono_contacto: data.telefono_contacto || null,
        direccion: data.direccion || null,
        tipoServicioId,
        datos_bancarios: data.datos_bancarios || null,
        observaciones: data.observaciones || null,
        estado: true,
      },
    });

    return NextResponse.json(
      { success: true, proveedor },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creando proveedor:", error);

    return NextResponse.json(
      { success: false, message: "Error interno al crear proveedor" },
      { status: 500 }
    );
  }
}

// =========================
// GET — Listar proveedores
// =========================
export async function GET() {
  try {
    const proveedores = await db.proveedor.findMany({
      orderBy: { id_proveedor: "desc" },
      include: {
        tipoServicio: true,
      },
    });

    // 🔥 IMPORTANTE: debe devolver SIEMPRE un array
    return NextResponse.json(proveedores);
  } catch (error) {
    console.error("Error obteniendo proveedores:", error);

    return NextResponse.json(
      { success: false, message: "Error al obtener proveedores" },
      { status: 500 }
    );
  }
}
