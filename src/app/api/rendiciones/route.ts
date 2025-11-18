/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { generarExcelRendicion } from "@/lib/excelGenerator";
import { generarPDFRecibo } from "@/lib/pdfGenerator";

// Calcular número y periodo
function calcularNumeroRendicion(fecha: Date) {
  const mes = fecha.getMonth() + 1; // Enero = 1
  const año = fecha.getFullYear();
  const nextMes = mes === 12 ? 1 : mes + 1;
  const nextAño = mes === 12 ? año + 1 : año;
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

    let ipcValor = 1;
    if (mes_ipc != null && anio_ipc != null) {
      const ipc = await db.ipc.findFirst({ where: { mes: Number(mes_ipc), anio: Number(anio_ipc) } });
      if (ipc?.valor != null) ipcValor = Number(ipc.valor);
    }

    const total = seleccionadas.reduce((acc, c) => acc + Number(c.monto || 0), 0);
    const totalAjustado = total * ipcValor;
    const totalFinal = new Prisma.Decimal(totalAjustado.toFixed(2));
    const fecha = fecha_rendicion ? new Date(fecha_rendicion) : new Date();
    const { numero, periodo } = calcularNumeroRendicion(fecha);

    const conectables = seleccionadas.map(c => ({ id_cobranza: c.id_cobranza }));
    const rend = await db.rendicion.create({
      data: {
        id_inmueble: inmuebles[0]!,
        fecha,
        monto_total: totalFinal,
        cobranzas: { connect: conectables },
        mes_ipc: mes_ipc ?? null,
        anio_ipc: anio_ipc ?? null,
      },
    });

    // Generar Excel
    const cobranzasExcel = seleccionadas.map(c => ({
      id_cobranza: c.id_cobranza,
      cliente: { nombre: c.cliente.nombre },
      concepto: c.concepto,
      monto: Number(c.monto),
      fecha_cobranza: c.fecha_cobranza?.toISOString(),
      contrato: c.id_contrato?.toString() ?? null,
      aumento_ipc: ipcValor,
      link_ipc:
        mes_ipc && anio_ipc ? "https://www.indec.gob.ar/indec/web/Nivel4-Tema-4-31" : null,
      pago_efvo: null,
      total_cobrado: Number(c.monto) * ipcValor,
      a_cobrar: Number(c.monto) * ipcValor,
    }));
    const excelBuffer = await generarExcelRendicion(`#${rend.id_rendicion}`, periodo, cobranzasExcel);

    // Guardar Excel temporal o servir por URL
    // Para simplificar aquí devolvemos la URL que tu front ya puede abrir
    const excelUrl = `/api/rendiciones/${rend.id_rendicion}/excel`;

    // Generar PDFs en memoria y preparar URLs
    const pdfs = seleccionadas
      .filter(c => c.genera_recibo)
      .map(c => `/api/rendiciones/${rend.id_rendicion}/pdf/recibo-${c.id_cobranza}.pdf`);

    return NextResponse.json({
      id_rendicion: rend.id_rendicion,
      numero,
      periodo,
      total,
      totalAjustado: totalFinal.toString(),
      mes_ipc: mes_ipc ?? null,
      anio_ipc: anio_ipc ?? null,
      excelUrl,
      pdfs,
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
      orderBy: { fecha: "desc" },
    });
    return NextResponse.json(rendiciones);
  } catch (e) {
    console.error("💥 Error al obtener rendiciones:", e);
    return NextResponse.json({ error: "No se pudieron cargar las rendiciones", detail: String(e) }, { status: 500 });
  }
}
