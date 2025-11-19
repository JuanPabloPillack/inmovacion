/* eslint-disable @typescript-eslint/no-explicit-any */
//cobranzas/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// =====================================================
// GET — obtener una cobranza por ID
// =====================================================
export async function GET(req: NextRequest, { params }: any) {
  const id_cobranza = Number(params.id);
  if (isNaN(id_cobranza))
    return NextResponse.json({ error: "ID inválido." }, { status: 400 });

  try {
    const cobranza = await db.cobranza.findUnique({
      where: { id_cobranza },
      include: {
        cliente: true,
        inmueble: { include: { ubicacion: true } },
      },
    });

    if (!cobranza)
      return NextResponse.json(
        { error: "Cobranza no encontrada." },
        { status: 404 }
      );

    const mapped = {
      ...cobranza,
      inmueble: cobranza.inmueble
        ? {
            ...cobranza.inmueble,
            nombre:
              cobranza.inmueble.titulo +
              (cobranza.inmueble.ubicacion?.direccion
                ? ` - ${cobranza.inmueble.ubicacion.direccion}`
                : ""),
          }
        : null,
    };

    return NextResponse.json({ cobranza: mapped });
  } catch (error) {
    console.error("❌ Error GET /cobranzas/[id]:", error);
    return NextResponse.json(
      { error: "Error al obtener cobranza." },
      { status: 500 }
    );
  }
}

// =====================================================
// DELETE — eliminar una cobranza
// =====================================================
export async function DELETE(req: NextRequest, { params }: any) {
  const id_cobranza = Number(params.id);
  if (isNaN(id_cobranza))
    return NextResponse.json({ error: "ID inválido." }, { status: 400 });

  try {
    const cobranza = await db.cobranza.findUnique({ where: { id_cobranza } });

    if (!cobranza)
      return NextResponse.json(
        { error: "Cobranza no encontrada." },
        { status: 404 }
      );

    await db.cobranza.delete({ where: { id_cobranza } });

    return NextResponse.json({ message: "Eliminada correctamente." });
  } catch (error) {
    console.error("❌ Error DELETE /cobranzas/[id]:", error);
    return NextResponse.json(
      { error: "Error al eliminar." },
      { status: 500 }
    );
  }
}

// =====================================================
// PUT — actualizar una cobranza
// =====================================================
export async function PUT(req: NextRequest, { params }: any) {
  const id_cobranza = Number(params.id);
  if (isNaN(id_cobranza))
    return NextResponse.json({ error: "ID inválido." }, { status: 400 });

  try {
    const existente = await db.cobranza.findUnique({
      where: { id_cobranza },
    });

    if (!existente)
      return NextResponse.json(
        { error: "Cobranza no encontrada." },
        { status: 404 }
      );

    const body = await req.json();
    const dataToUpdate: any = {};

    if ("id_cliente" in body)
      dataToUpdate.id_cliente = Number(body.id_cliente);

    if ("id_contrato" in body && body.id_contrato) {
      const contrato = await db.contrato.findUnique({
        where: { id_contrato: Number(body.id_contrato) },
        include: { inmueble: true },
      });
      dataToUpdate.id_contrato = Number(body.id_contrato);
      dataToUpdate.id_inmueble = contrato?.inmueble?.id_inmueble || null;
    }

    if ("monto" in body) dataToUpdate.monto = Number(body.monto);
    if ("medio_pago" in body) dataToUpdate.medio_pago = body.medio_pago;
    if ("concepto" in body) dataToUpdate.concepto = body.concepto;
    if ("observaciones" in body)
      dataToUpdate.observaciones = body.observaciones ?? null;

    if ("fecha_cobranza" in body && body.fecha_cobranza) {
      const [y, m, d] = body.fecha_cobranza.split("-").map(Number);
      dataToUpdate.fecha_cobranza = new Date(y, m - 1, d, 12, 0, 0);
    }

    if ("activa" in body) dataToUpdate.activa = Boolean(body.activa);

    const updated = await db.cobranza.update({
      where: { id_cobranza },
      data: dataToUpdate,
      include: {
        cliente: true,
        inmueble: { include: { ubicacion: true } },
      },
    });

    const mapped = {
      ...updated,
      inmueble: updated.inmueble
        ? {
            ...updated.inmueble,
            nombre:
              updated.inmueble.titulo +
              (updated.inmueble.ubicacion?.direccion
                ? ` - ${updated.inmueble.ubicacion.direccion}`
                : ""),
          }
        : null,
    };

    return NextResponse.json({ updated: mapped });
  } catch (error) {
    console.error("❌ Error PUT /cobranzas/[id]:", error);
    return NextResponse.json(
      { error: "Error al actualizar." },
      { status: 500 }
    );
  }
}