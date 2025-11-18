//api/[id]rendiciones/route.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { generarExcelRendicion } from "@/lib/excelGenerator";
import { generarPDFRecibo } from "@/lib/pdfGenerator";

// Calcular número y periodo
function calcularNumeroRendicion(fecha: Date) {
  const mes = fecha.getMonth();
  const año = fecha.getFullYear();
  const nextMes = mes === 11 ? 1 : mes + 2;
  const nextAño = mes === 11 ? año + 1 : año;
  return { numero: `${nextMes}-${nextAño}`, periodo: `${nextMes}/${nextAño}` };
}

// POST /api/rendiciones
export async function POST(req: NextRequest) {
  try {
    const { cobranzas, fecha_rendicion, mes_ipc, anio_ipc } = await req.json();

    if (!Array.isArray(cobranzas) || cobranzas.length === 0)
      return NextResponse.json({ error: "Seleccioná cobranzas" }, { status: 400 });

    const seleccionadas = await db.cobranza.findMany({
      where: { id_cobranza: { in: cobranzas }, id_rendicion: null },
      include: { cliente: true, inmueble: true, recibo: true },
    });

    if (seleccionadas.length === 0)
      return NextResponse.json({ error: "Las cobranzas ya fueron rendidas o no existen" }, { status: 404 });

    const inmuebles = [...new Set(seleccionadas.map(c => c.id_inmueble).filter(Boolean))];
    if (inmuebles.length !== 1)
      return NextResponse.json({ error: "Las cobranzas deben pertenecer al mismo inmueble" }, { status: 400 });

    const total = seleccionadas.reduce((acc, c) => acc + Number(c.monto || 0), 0);
    let totalAjustado = total;
    if (mes_ipc != null && anio_ipc != null) {
      const ipc = await db.ipc.findFirst({ where: { mes: Number(mes_ipc), anio: Number(anio_ipc) } });
      if (ipc?.valor != null) totalAjustado = total * Number(ipc.valor);
    }

    const totalFinal = new Prisma.Decimal(totalAjustado.toFixed(2));
    const fecha = fecha_rendicion ? new Date(fecha_rendicion) : new Date();
    const { numero, periodo } = calcularNumeroRendicion(fecha);

    const conectables = seleccionadas.map(c => ({ id_cobranza: c.id_cobranza }));
    const rend = await db.rendicion.create({
      data: { id_inmueble: inmuebles[0]!, fecha, monto_total: totalFinal, cobranzas: { connect: conectables } },
    });

    // Generar Excel y PDFs en memoria
    const excelBuffer = await generarExcelRendicion(numero, periodo, seleccionadas.map(c => ({ ...c, monto: Number(c.monto) })));
    const pdfBuffers = [];
    for (const c of seleccionadas) {
      if (c.genera_recibo) {
        const buffer = await generarPDFRecibo({ ...c, monto: Number(c.monto), total: c.recibo?.total != null ? Number(c.recibo.total) : Number(c.monto) });
        pdfBuffers.push({ nombre: `recibo-${c.id_cobranza}.pdf`, buffer });
      }
    }

    // Devolver URLs simuladas y buffers en memoria
    return NextResponse.json({
      id_rendicion: rend.id_rendicion,
      excelUrl: `/api/rendiciones/${rend.id_rendicion}/excel`,
      pdfs: pdfBuffers.map(p => `/api/rendiciones/${rend.id_rendicion}/pdf/${p.nombre}`),
      numero,
      periodo,
      total,
      totalAjustado: totalFinal.toString(),
      mes_ipc: mes_ipc ?? null,
      anio_ipc: anio_ipc ?? null,
      _buffers: { excel: excelBuffer, pdfs: pdfBuffers },
    });
  } catch (e) {
    console.error("💥 Error en POST /rendiciones:", e);
    return NextResponse.json({ error: "Error al registrar la rendición", detail: String(e) }, { status: 500 });
  }
}

// GET /api/rendiciones
export async function GET() {
  try {
    const rendiciones = await db.rendicion.findMany({
      include: { inmueble: true, cobranzas: { include: { cliente: true, recibo: true } } },
      orderBy: { fecha: 'desc' },
    });
    return NextResponse.json(rendiciones);
  } catch (e) {
    console.error("💥 Error al obtener rendiciones:", e);
    return NextResponse.json({ error: "No se pudieron cargar las rendiciones", detail: String(e) }, { status: 500 });
  }
}

// DELETE /api/rendiciones/:id
export async function DELETE(req: NextRequest, { params }: any) {
  const id = Number(params.id);
  if (isNaN(id)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

  try {
    console.log("🔹 DELETE rendición ID:", id);

    // 🔹 Buscar rendición antes de eliminar
    const rendicion = await db.rendicion.findUnique({
      where: { id_rendicion: id },
      include: { cobranzas: true },
    });
    console.log("📌 Rendición encontrada:", rendicion);

    if (!rendicion) {
      return NextResponse.json({ error: "Rendición no encontrada" }, { status: 404 });
    }

    // 🔹 Revisar cuántas cobranzas están vinculadas
    console.log("📌 Cobranzas vinculadas:", rendicion.cobranzas.length);

    // 🔹 Usar transacción para desvincular cobranzas y eliminar rendición
    const result = await db.$transaction(async (tx) => {
      console.log("🔹 Desvinculando cobranzas...");
      const desvinculadas = await tx.cobranza.updateMany({
        where: { id_rendicion: id },
        data: { id_rendicion: null },
      });
      console.log("✅ Cobranzas desvinculadas:", desvinculadas.count);

      console.log("🔹 Eliminando rendición...");
      const deleted = await tx.rendicion.delete({
        where: { id_rendicion: id },
      });
      console.log("✅ Rendición eliminada:", deleted);

      return { desvinculadas, deleted };
    });

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error("💥 Error al eliminar rendición:", error);

    return NextResponse.json({
      error: "No se pudo eliminar la rendición",
      message: error.message,
      code: error.code,
      meta: error.meta,
    }, { status: 500 });
  }
}
