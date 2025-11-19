// app/api/rendiciones/[id]/excel/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generarExcelRendicion } from "@/lib/excelGenerator";

// Función helper para saldo anterior (mover a utils si se usa en múltiples lugares)
async function calcularSaldoAnterior(id_inmueble: number, fechaActual: Date) {
  const prevRend = await db.rendicion.findFirst({
    where: {
      id_inmueble,
      fecha: { lt: fechaActual },
    },
    orderBy: { fecha: 'desc' },
    select: { monto_total: true },
  });
  // Lógica simplificada: usar monto_total de previa como saldo (ajustar para ingresos - egresos reales)
  return prevRend ? Number(prevRend.monto_total) : 0;
}

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id_rendicion = Number(params.id);

    if (isNaN(id_rendicion)) {
      return NextResponse.json(
        { error: "ID de rendición inválido" },
        { status: 400 }
      );
    }

    const rend = await db.rendicion.findUnique({
      where: { id_rendicion },
      include: {
        inmueble: true, // Para contexto si se necesita
        cobranzas: {
          include: {
            cliente: true,
            inmueble: { 
              include: { 
                ubicacion: true // Para unFuncional
              } 
            },
            recibo: true,
            // contrato: true, // Incluir si se agrega relación en schema
          },
        },
      },
    });

    if (!rend)
      return NextResponse.json(
        { error: "Rendición no encontrada" },
        { status: 404 }
      );

    // IPC
    const ipcDataRaw =
      rend.mes_ipc && rend.anio_ipc
        ? await db.ipc.findFirst({
            where: {
              mes: rend.mes_ipc,
              anio: rend.anio_ipc,
            },
          })
        : null;

    const ipc = {
      mes: rend.mes_ipc,
      anio: rend.anio_ipc,
      valor: ipcDataRaw?.valor?.toNumber() ?? null,
    };

    // Saldo anterior: calcular de rendición previa
    const saldoAnterior = await calcularSaldoAnterior(rend.id_inmueble, rend.fecha);

    // COBRANZAS → mapeo ajustado a nueva interfaz (con derivados)
    const cobranzasForExcel = rend.cobranzas.map((c) => {
      const montoBase = Number(c.monto);
      const totalCobrar = ipc.valor && ipc.valor !== 1 ? Number((montoBase * ipc.valor).toFixed(2)) : montoBase;
      const totalCobr = c.pagado ? totalCobrar : 0;
      const aCobrar = totalCobrar - totalCobr;

      // unFuncional
      const unFunc = c.inmueble ? `${c.inmueble.ubicacion?.direccion || ''}: ${c.inmueble.titulo || ''}`.trim() : '';

      // contratoStr: placeholder si no hay relación
      const contratoStr = c.id_contrato ? `Contrato ${c.id_contrato}` : '';

      // ipcAumento
      const ipcAumentoStr = ipc.valor && ipc.valor !== 1 ? `IPC ${ipc.anio ?? ''} - Ajuste ${((ipc.valor - 1) * 100).toFixed(2)}%` : '';

      return {
        id_cobranza: c.id_cobranza,
        id_inmueble: c.id_inmueble,
        id_contrato: c.id_contrato,
        cliente: { 
          nombre: c.cliente.nombre,
          email: c.cliente.email,
          telefono: c.cliente.telefono,
        },
        inmueble: c.inmueble ? {
          titulo: c.inmueble.titulo,
          ubicacion: {
            direccion: c.inmueble.ubicacion?.direccion || '',
          },
        } : undefined,
        // contrato: c.contrato, // Descomentar si se agrega
        concepto: c.concepto,
        monto: montoBase, // monto original
        fecha_cobranza: c.fecha_cobranza
          .toISOString()
          .substring(0, 10),
        numero_recibo: c.numero_recibo ?? c.recibo?.id_recibo ?? null,
        genera_recibo: c.genera_recibo,
        pagado: c.pagado,
        observaciones: c.observaciones,
        // Derivados
        total_cobrar: totalCobrar,
        total_cobrado: totalCobr,
        a_cobrar: aCobrar,
        unFuncional: unFunc,
        contratoStr: contratoStr,
        ipcAumento: ipcAumentoStr,
        ipcValor: ipc.valor,
      };
    });

    const excelBuffer = await generarExcelRendicion(
      rend.id_rendicion,
      rend.fecha.toISOString().substring(0, 10),
      cobranzasForExcel,
      ipc,
      saldoAnterior
    );

    const uint8Array = new Uint8Array(excelBuffer);

    return new NextResponse(uint8Array, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename=rendicion-${id_rendicion}.xlsx`,
      },
    });
  } catch (error) {
    console.error("💥 Error al generar Excel:", error);
    return NextResponse.json(
      { error: "No se pudo generar el Excel", detail: String(error) },
      { status: 500 }
    );
  }
}