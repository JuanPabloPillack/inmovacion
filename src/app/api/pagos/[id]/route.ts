/* eslint-disable @typescript-eslint/no-explicit-any */
// ===============================================
// API: Pago a Proveedor (Detalle, Update, Delete)
// Ruta: /api/pagos-proveedores/:id
// Runtime Node.js
// ===============================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ===============================================
// GET — Obtener un pago por ID
// ===============================================
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "ID inválido" },
        { status: 400 }
      );
    }

    const pago = await db.pagoProveedor.findUnique({
      where: { id_pago: id },
      include: {
        proveedor: true,
        medioPago: true,
        estadoPago: true,
      },
    });

    if (!pago) {
      return NextResponse.json(
        { error: "Pago no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(pago);
  } catch (error) {
    console.error("Error obteniendo pago:", error);
    return NextResponse.json(
      { error: "Error al obtener el pago" },
      { status: 500 }
    );
  }
}

// ===============================================
// PUT — Actualizar un pago a proveedor
// ===============================================
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    const data = await req.json();

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, message: "ID inválido" },
        { status: 400 }
      );
    }

    const pago = await db.pagoProveedor.update({
      where: { id_pago: id },
      data: {
        concepto: data.concepto,
        importe: Number(data.importe),
        medioPagoId: Number(data.medioPagoId),
        estadoPagoId: Number(data.estadoPagoId),
        comprobante: data.comprobante || null,
        responsable: data.responsable,
        fecha_pago: data.fecha_pago ? new Date(data.fecha_pago) : undefined,
      },
    });

    return NextResponse.json(
      { success: true, pago },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error actualizando pago:", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Error interno al actualizar pago",
      },
      { status: 500 }
    );
  }
}

// ===============================================
// DELETE — Eliminar un pago a proveedor
// ===============================================
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "ID inválido" },
        { status: 400 }
      );
    }

    await db.pagoProveedor.delete({
      where: { id_pago: id },
    });

    return NextResponse.json(
      { success: true, message: "Pago eliminado" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error eliminando pago:", error);
    return NextResponse.json(
      { error: "Error al eliminar pago" },
      { status: 500 }
    );
  }
}