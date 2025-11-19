import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generarPDFRecibo } from "@/lib/pdfGenerator";
import { Prisma } from "@prisma/client";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string; nombre: string } }
) {
  const id = Number(params.id);
  if (isNaN(id)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  const { nombre } = params;

  // ===============================
  // extraer id desde recibo-123.pdf
  // ===============================
  const match = nombre.match(/recibo-(\d+)\.pdf/);
  if (!match) {
    return NextResponse.json({ error: "Nombre inválido" }, { status: 400 });
  }

  const idCobranza = Number(match[1]);

  // ===============================
  // Buscar cobranza con cliente + inmueble + recibo
  // ===============================
  const cobranza = await db.cobranza.findUnique({
    where: { id_cobranza: idCobranza },
    include: {
      cliente: true,
      inmueble: true,
      recibo: true,
    },
  });

  if (!cobranza) {
    return NextResponse.json(
      { error: "Cobranza no encontrada" },
      { status: 404 }
    );
  }

  // ===============================
  // Total final (Prisma.Decimal -> number)
  // ===============================
  const totalNum =
    cobranza.recibo?.total instanceof Prisma.Decimal
      ? cobranza.recibo.total.toNumber()
      : Number(cobranza.recibo?.total ?? cobranza.monto);

  // ===============================
  // Objeto para PDF
  // ===============================
  const pdfData = {
    id_cobranza: cobranza.id_cobranza,
    monto: Number(cobranza.monto),
    total: totalNum,
    numero_recibo: cobranza.numero_recibo ?? null,
    cliente: {
      nombre: cobranza.cliente.nombre,
      email: cobranza.cliente.email,
      telefono: cobranza.cliente.telefono,
    },
    inmueble: cobranza.inmueble,
  };

  // ===============================
  // Generar PDF tipo recibo
  // ===============================
  const pdfBuffer = await generarPDFRecibo(pdfData);

  return new NextResponse(new Uint8Array(pdfBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=${nombre}`,
    },
  });
}
