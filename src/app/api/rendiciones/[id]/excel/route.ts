// app/api/rendiciones/[id]/excel/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generarExcelRendicion, CobranzaForExcel } from "@/lib/excelGenerator";

// GET /api/rendiciones/:id/excel
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  if (isNaN(id)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  // Buscar rendición con cobranzas y clientes
  const rendicion = await db.rendicion.findUnique({
    where: { id_rendicion: id },
    include: { cobranzas: { include: { cliente: true } } },
  });

  if (!rendicion) {
    return NextResponse.json({ error: "Rendición no encontrada" }, { status: 404 });
  }

  const numero = `#${rendicion.id_rendicion}`;
  const periodo = rendicion.fecha.toLocaleDateString();

  // Obtener valor del IPC si existe
  let ipcValor = 1;
  if (rendicion.mes_ipc && rendicion.anio_ipc) {
    const ipc = await db.ipc.findFirst({
      where: { mes: rendicion.mes_ipc, anio: rendicion.anio_ipc },
      orderBy: { fechaConsulta: "desc" }, // si hay varias versiones
    });
    if (ipc?.valor) ipcValor = Number(ipc.valor);
  }

  // Preparar datos de cobranzas para Excel
  const cobranzasExcel: CobranzaForExcel[] = rendicion.cobranzas.map((c) => ({
    id_cobranza: c.id_cobranza,
    cliente: { nombre: c.cliente.nombre },
    concepto: c.concepto,
    monto: Number(c.monto),
    fecha_cobranza: c.fecha_cobranza.toLocaleDateString(),
    contrato: c.id_contrato?.toString() ?? null,
    // Mostrar IPC como porcentaje
    aumento_ipc: rendicion.mes_ipc && rendicion.anio_ipc ? ((ipcValor - 1) * 100).toFixed(2) + " %" : null,
    link_ipc: rendicion.mes_ipc && rendicion.anio_ipc
      ? "https://www.indec.gob.ar/indec/web/Nivel4-Tema-4-31"
      : null,
    pago_efvo: null,
    total_cobrado: Number(c.monto) * ipcValor,
    a_cobrar: Number(c.monto) * ipcValor,
  }));

  // Generar buffer del Excel
  const excelBuffer = await generarExcelRendicion(numero, periodo, cobranzasExcel);

  return new NextResponse(new Uint8Array(excelBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename=rendicion-${id}.xlsx`,
    },
  });
}
