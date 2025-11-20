/* eslint-disable @typescript-eslint/no-explicit-any */
// ===============================================
// API: Pagos a Proveedor (Listado y Creación)
// Ruta: /api/pagos
// Runtime Node.js
// ===============================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ===============================================
// GET — Listar todos los pagos
// ===============================================
export async function GET() {
  try {
    const pagos = await db.pagoProveedor.findMany({
      orderBy: { fecha_pago: "desc" },
      include: {
        proveedor: true,
        medioPago: true,
        estadoPago: true,
      },
    });

    return NextResponse.json(pagos);
  } catch (error) {
    console.error("Error cargando pagos a proveedores:", error);
    return NextResponse.json(
      { error: "Error al obtener pagos a proveedores" },
      { status: 500 }
    );
  }
}

// ===============================================
// POST — Crear un pago a proveedor
// ===============================================
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    const proveedorId = Number(data.proveedorId);
    const medioPagoId = Number(data.medioPagoId);
    const estadoPagoId = Number(data.estadoPagoId);
    const importe = Number(data.importe);

    if (isNaN(proveedorId) || proveedorId <= 0) {
      return NextResponse.json(
        { success: false, message: "proveedorId inválido" },
        { status: 400 }
      );
    }

    if (isNaN(medioPagoId)) {
      return NextResponse.json(
        { success: false, message: "medioPagoId inválido" },
        { status: 400 }
      );
    }

    if (isNaN(estadoPagoId)) {
      return NextResponse.json(
        { success: false, message: "estadoPagoId inválido" },
        { status: 400 }
      );
    }

    if (isNaN(importe)) {
      return NextResponse.json(
        { success: false, message: "importe inválido" },
        { status: 400 }
      );
    }

    const pago = await db.pagoProveedor.create({
      data: {
        proveedorId,
        medioPagoId,
        estadoPagoId,
        importe,
        concepto: data.concepto,
        comprobante: data.comprobante || null,
        responsable: data.responsable,
        fecha_pago: data.fecha_pago ? new Date(data.fecha_pago) : new Date(),
      },
    });

    return NextResponse.json({ success: true, pago }, { status: 201 });
  } catch (error: any) {
    console.error("Error creando pago a proveedor:", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Error interno al crear pago",
      },
      { status: 500 }
    );
  }
}