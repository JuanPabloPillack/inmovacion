// app/api/rendiciones/[id]/excel/route.ts

// Importamos utilidades del runtime de Next.js
import { NextRequest, NextResponse } from "next/server";

// Importamos la instancia de Prisma configurada en /lib/db
import { db } from "@/lib/db";

// Función que genera el archivo Excel
import { generarExcelRendicion } from "@/lib/excelGenerator";

/* --------------------------------------------------------------------------
   FUNCION HELPER → calcularSaldoAnterior
   Esta función busca la rendición anterior para un mismo inmueble,
   con fecha menor a la fecha de la rendición actual, para obtener
   el "saldo anterior" que aparecerá en el Excel.
   -------------------------------------------------------------------------- */
async function calcularSaldoAnterior(id_inmueble: number, fechaActual: Date) {
  const prevRend = await db.rendicion.findFirst({
    where: {
      id_inmueble,
      fecha: { lt: fechaActual }, // rendiciones anteriores
    },
    orderBy: { fecha: "desc" }, // buscamos la más reciente entre las antiguas
    select: { monto_total: true }, // solo queremos el monto_total
  });

  // Si existe, devolvemos el monto; si no, 0
  return prevRend ? Number(prevRend.monto_total) : 0;
}

// Marcamos esta ruta como dinámica → Next.js no la cachea
export const dynamic = "force-dynamic";

/* ===========================================================================
   GET → Generación del Excel de una rendición
   URL: /api/rendiciones/[id]/excel
   =========================================================================== */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    /* ----------------------------------------------------------------------
       1) Validación del ID recibido
       ---------------------------------------------------------------------- */
    const id_rendicion = Number(params.id);

    if (isNaN(id_rendicion)) {
      return NextResponse.json(
        { error: "ID de rendición inválido" },
        { status: 400 }
      );
    }

    /* ----------------------------------------------------------------------
       2) Buscar la rendición en la base de datos
       Incluye sus cobranzas y datos relacionados.
       ---------------------------------------------------------------------- */
    const rend = await db.rendicion.findUnique({
      where: { id_rendicion },
      include: {
        inmueble: true, // info general del inmueble
        cobranzas: {
          include: {
            cliente: true,
            // Incluimos datos de inmueble y su ubicación
            inmueble: { include: { ubicacion: true } },
            recibo: true,
          },
        },
      },
    });

    if (!rend)
      return NextResponse.json(
        { error: "Rendición no encontrada" },
        { status: 404 }
      );

    /* ----------------------------------------------------------------------
       3) Calcular IPC si la rendición tiene mes_ipc y anio_ipc configurados
       ---------------------------------------------------------------------- */
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
      valor: ipcDataRaw?.valor?.toNumber() ?? null, // null si no existe
    };

    /* ----------------------------------------------------------------------
       4) Calcular S A L D O   A N T E R I O R
       Buscamos la rendición previa del mismo inmueble.
       ---------------------------------------------------------------------- */
    const saldoAnterior = await calcularSaldoAnterior(
      rend.id_inmueble,
      rend.fecha
    );

    /* ----------------------------------------------------------------------
       5) Mapeo de cobranzas → Formato requerido por el Excel
       Calculamos derivados: total_cobrar, total_cobrado, a_cobrar, etc.
       ---------------------------------------------------------------------- */
    const cobranzasForExcel = rend.cobranzas.map((c) => {
      const montoBase = Number(c.monto);

      // Aplicación del IPC si corresponde
      const totalCobrar =
        ipc.valor && ipc.valor !== 1
          ? Number((montoBase * ipc.valor).toFixed(2))
          : montoBase;

      const totalCobr = c.pagado ? totalCobrar : 0;
      const aCobrar = totalCobrar - totalCobr;

      // Ejemplo: "San Martín 123: Dpto 4B"
      const unFunc = c.inmueble
        ? `${c.inmueble.ubicacion?.direccion || ""}: ${
            c.inmueble.titulo || ""
          }`.trim()
        : "";

      // Placeholder si no hay relación real con contratos
      const contratoStr = c.id_contrato ? `Contrato ${c.id_contrato}` : "";

      // Texto para indicar ajuste por IPC
      const ipcAumentoStr =
        ipc.valor && ipc.valor !== 1
          ? `IPC ${ipc.anio ?? ""} - Ajuste ${(
              (ipc.valor - 1) *
              100
            ).toFixed(2)}%`
          : "";

      return {
        id_cobranza: c.id_cobranza,
        id_inmueble: c.id_inmueble,
        id_contrato: c.id_contrato,

        cliente: {
          nombre: c.cliente.nombre,
          email: c.cliente.email,
          telefono: c.cliente.telefono,
        },

        inmueble: c.inmueble
          ? {
              titulo: c.inmueble.titulo,
              ubicacion: {
                direccion: c.inmueble.ubicacion?.direccion || "",
              },
            }
          : undefined,

        concepto: c.concepto,
        monto: montoBase,
        fecha_cobranza: c.fecha_cobranza.toISOString().substring(0, 10),
        numero_recibo: c.numero_recibo ?? c.recibo?.id_recibo ?? null,
        genera_recibo: c.genera_recibo,
        pagado: c.pagado,
        observaciones: c.observaciones,

        // Derivados
        total_cobrar: totalCobrar,
        total_cobrado: totalCobr,
        a_cobrar: aCobrar,
        unFuncional: unFunc,
        contratoStr,
        ipcAumento: ipcAumentoStr,
        ipcValor: ipc.valor,
      };
    });

    /* ----------------------------------------------------------------------
       6) Generar el Excel FINAL
       ---------------------------------------------------------------------- */
    const excelBuffer = await generarExcelRendicion(
      rend.id_rendicion, // nombre del archivo
      rend.fecha.toISOString().substring(0, 10),
      cobranzasForExcel,
      ipc,
      saldoAnterior
    );

    const uint8Array = new Uint8Array(excelBuffer);

    /* ----------------------------------------------------------------------
       7) Devolver el archivo Excel
       ---------------------------------------------------------------------- */
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
      {
        error: "No se pudo generar el Excel",
        detail: String(error),
      },
      { status: 500 }
    );
  }
}
