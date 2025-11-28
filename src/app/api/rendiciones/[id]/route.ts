/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { generarExcelRendicion, CobranzaForExcel } from "@/lib/excelGenerator";


// =========================================================
// 🔹 HELPER: CALCULAR SALDO ANTERIOR
// Busca la rendición anterior a una fecha dada y devuelve su monto total.
// Si no hay rendición anterior, devuelve 0.
// =========================================================
async function calcularSaldoAnterior(id_inmueble: number, fechaActual: Date) {
  const prevRend = await db.rendicion.findFirst({
    where: { id_inmueble, fecha: { lt: fechaActual } },
    orderBy: { fecha: "desc" },
    select: { monto_total: true },
  });
  return prevRend ? Number(prevRend.monto_total) : 0;
}



// =========================================================
//  📌 GET — Obtener los datos de una rendición por ID
// =========================================================
export async function GET(req: NextRequest, context: { params: { id: string } }) {

  const { params } = context;
  const id_rendicion = Number(params.id);

  // Validación del ID recibido
  if (isNaN(id_rendicion))
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });

  try {
    // Buscamos la rendición con sus relaciones
    const rendicion = await db.rendicion.findUnique({
      where: { id_rendicion },
      include: {
        inmueble: true,
        cobranzas: {
          include: {
            cliente: true,
            recibo: true,
            inmueble: {
              include: { ubicacion: true },
            },
          },
        },
      },
    });

    if (!rendicion)
      return NextResponse.json({ error: "Rendición no encontrada" }, { status: 404 });

    return NextResponse.json({ rendicion });

  } catch (err: any) {
    return NextResponse.json(
      { error: "No se pudo obtener la rendición", detail: String(err) },
      { status: 500 }
    );
  }
}



// =========================================================
//  📌 PUT — Actualizar una rendición + generar Excel
// =========================================================
export async function PUT(req: NextRequest, context: { params: { id: string } }) {

  const { params } = context;
  const id_rendicion = Number(params.id);

  if (isNaN(id_rendicion))
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });

  try {
    // Extraemos datos enviados por el frontend
    const body = await req.json();
    const { cobranzas, mes_ipc, anio_ipc } = body;

    // Validación
    if (!Array.isArray(cobranzas) || cobranzas.length === 0)
      return NextResponse.json({ error: "Seleccioná cobranzas", status: 400 });

    // Convertimos IDs a número y filtramos inválidos
    const idsCobranzas = cobranzas.map((id: any) => Number(id)).filter(Boolean);

    if (idsCobranzas.length === 0)
      return NextResponse.json({ error: "IDs de cobranzas inválidos" }, { status: 400 });

    // Verificamos que la rendición exista
    const existing = await db.rendicion.findUnique({
      where: { id_rendicion },
      include: { cobranzas: true },
    });

    if (!existing)
      return NextResponse.json({ error: "Rendición no encontrada" }, { status: 404 });

    // Cobranzas seleccionadas
    const seleccionadas = await db.cobranza.findMany({
      where: { id_cobranza: { in: idsCobranzas } },
      include: { 
        cliente: true,
        inmueble: { include: { ubicacion: true } } 
      },
    });

    if (seleccionadas.length === 0)
      return NextResponse.json({ error: "Las cobranzas ya fueron rendidas o no existen", status: 404 });

    // Verificamos que todas las cobranzas pertenecen al mismo inmueble
    const inmuebles = [...new Set(seleccionadas.map((c) => c.id_inmueble).filter(Boolean))];
    if (inmuebles.length !== 1)
      return NextResponse.json({ error: "Las cobranzas deben pertenecer al mismo inmueble", status: 400 });

    // Sumamos todas las cobranzas
    const total = seleccionadas.reduce((acc, c) => acc + Number(c.monto ?? 0), 0);

    const monto_total = new Prisma.Decimal(total.toFixed(2));

    // =========================================================
    // 🔹 TRANSACCIÓN
    // 1. Quitamos cobranzas anteriores
    // 2. Actualizamos la rendición
    // 3. Asignamos las nuevas cobranzas a esta rendición
    // =========================================================
    await db.$transaction(async (tx) => {
      await tx.cobranza.updateMany({
        where: { id_rendicion },
        data: { id_rendicion: null },
      });

      await tx.rendicion.update({
        where: { id_rendicion },
        data: { monto_total, mes_ipc: mes_ipc ?? null, anio_ipc: anio_ipc ?? null },
      });

      await Promise.all(
        idsCobranzas.map((id) =>
          tx.cobranza.update({
            where: { id_cobranza: id },
            data: { id_rendicion },
          })
        )
      );
    });

    // Buscamos saldo anterior
    const saldoAnterior = await calcularSaldoAnterior(inmuebles[0]!, new Date());

    // =========================================================
    // 🔹 FORMATEAMOS DATOS PARA EL EXCEL
    // =========================================================
    const cobranzasExcel: CobranzaForExcel[] = seleccionadas.map((c) => {
      const total_cobrar = Number(c.monto ?? 0);
      const pagado = Boolean(c.pagado);
      const total_cobrado = pagado ? total_cobrar : 0;
      const a_cobrar = total_cobrar - total_cobrado;

      return {
        id_cobranza: c.id_cobranza,
        id_inmueble: c.id_inmueble ?? null,
        id_contrato: c.id_contrato ?? null,

        cliente: {
          nombre: c.cliente.nombre,
          email: c.cliente.email ?? null,
          telefono: c.cliente.telefono ?? null,
        },

        inmueble: c.inmueble
          ? {
              titulo: c.inmueble.titulo,
              ubicacion: {
                direccion: c.inmueble.ubicacion?.direccion ?? "",
              },
            }
          : undefined,

        concepto: c.concepto,
        monto: total_cobrar,
        fecha_cobranza: c.fecha_cobranza?.toISOString().substring(0, 10) ?? "",
        numero_recibo: c.numero_recibo ?? null,
        genera_recibo: c.genera_recibo ?? false,
        pagado,
        observaciones: c.observaciones ?? null,

        total_cobrar,
        total_cobrado,
        a_cobrar,

        unFuncional: c.inmueble
          ? `${c.inmueble.ubicacion?.direccion ?? ""}: ${c.inmueble.titulo ?? ""}`
          : "",

        contratoStr: c.id_contrato ? `Contrato ${c.id_contrato}` : "",
        ipcAumento: mes_ipc && anio_ipc ? `IPC ${anio_ipc}` : "",
        ipcValor: 1,
      };
    });

    // =========================================================
    // 🔹 GENERAMOS EL EXCEL — devuelve un buffer
    // =========================================================
    const buffer = await generarExcelRendicion(
      `Rendicion_${id_rendicion}`,
      new Date().toISOString().substring(0, 10),
      cobranzasExcel,
      { mes: mes_ipc, anio: anio_ipc, valor: 1 },
      saldoAnterior
    );

    // 📤 Devolvemos el archivo Excel
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename=Rendicion_${id_rendicion}.xlsx`,
      },
    });

  } catch (err: any) {
    return NextResponse.json(
      { error: "No se pudo actualizar la rendición", detail: err.message || String(err) },
      { status: 500 }
    );
  }
}



// =========================================================
//  📌 DELETE — Eliminar rendición + desasignar cobranzas
// =========================================================
export async function DELETE(req: NextRequest, context: { params: { id: string } }) {

  const { params } = context;
  const id = Number(params.id);

  if (isNaN(id))
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });

  try {
    const rendicion = await db.rendicion.findUnique({
      where: { id_rendicion: id },
      include: { cobranzas: true },
    });

    if (!rendicion)
      return NextResponse.json({ error: "Rendición no encontrada" }, { status: 404 });

    // Transacción para borrar
    const result = await db.$transaction(async (tx) => {
      await tx.cobranza.updateMany({
        where: { id_rendicion: id },
        data: { id_rendicion: null },
      });

      return tx.rendicion.delete({ where: { id_rendicion: id } });
    });

    return NextResponse.json({ success: true, result });

  } catch (error: any) {
    return NextResponse.json(
      { error: "No se pudo eliminar la rendición", detail: error.message },
      { status: 500 }
    );
  }
}
