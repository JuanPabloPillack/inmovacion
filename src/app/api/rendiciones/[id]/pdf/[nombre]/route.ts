//app/api/rendiciones/[id]/pdf/[nombre]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generarPDFRecibo } from "@/lib/pdfGenerator";
import { Prisma } from "@prisma/client";

// GET /api/rendiciones/:id/pdf/:nombre
export async function GET(req: NextRequest, { params }: { params: { id: string; nombre: string } }) {
  const id = Number(params.id);
  if (isNaN(id)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

  const { nombre } = params;
  const match = nombre.match(/recibo-(\d+)\.pdf/);
  if (!match) return NextResponse.json({ error: "Nombre inválido" }, { status: 400 });

  const idCobranza = Number(match[1]);
  const cobranza = await db.cobranza.findUnique({
    where: { id_cobranza: idCobranza },
    include: { cliente: true, inmueble: true, recibo: true },
  });
  if (!cobranza) return NextResponse.json({ error: "Cobranza no encontrada" }, { status: 404 });

  const totalNum = cobranza.recibo?.total instanceof Prisma.Decimal
    ? cobranza.recibo.total.toNumber()
    : Number(cobranza.recibo?.total ?? cobranza.monto);

  const pdfBuffer = await generarPDFRecibo({ ...cobranza, monto: Number(cobranza.monto), total: totalNum });

  return new NextResponse(new Uint8Array(pdfBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=${nombre}`,
    },
  });
}
