// src/app/api/rendiciones/route.ts
/* eslint-disable @typescript-eslint/no-explicit-any */

// Importamos herramientas del framework Next.js para manejar requests/responses HTTP
import { NextRequest, NextResponse } from "next/server";

// Importamos la conexión a la base de datos mediante Prisma
import { db } from "@/lib/db";

// Importamos tipos de Prisma
import { Prisma } from "@prisma/client";

// Funciones para generar archivos (EXCEL y PDF)
import { generarExcelRendicion } from "@/lib/excelGenerator";
import { generarPDFRecibo } from "@/lib/pdfGenerator";

import { auth } from "../../../../auth";


// ========================================================
// FUNCIÓN AUXILIAR — Genera número y período de rendición
// ========================================================
/*
  Dado una fecha, esta función calcula:
  - número de rendición (ej: "3-2025")
  - período de rendición (ej: "3/2025")

  La lógica es: usa el mes siguiente al de la fecha pasada.
*/
function calcularNumeroRendicion(fecha: Date) {
  const mes = fecha.getMonth() + 1;
  const año = fecha.getFullYear();

  // Si es diciembre → el próximo mes es enero del año siguiente
  const nextMes = mes === 12 ? 1 : mes + 1;
  const nextAño = mes === 12 ? año + 1 : año;

  return { numero: `${nextMes}-${nextAño}`, periodo: `${nextMes}/${nextAño}` };
}


// ========================================================
// FUNCIÓN AUXILIAR — Calcula saldo anterior de un inmueble
// ========================================================
/*
  Devuelve el monto_total de la última rendición previa al día actual.
  Si no existe, devuelve 0.
*/
async function calcularSaldoAnterior(id_inmueble: number, fechaActual: Date) {
  const prevRend = await db.rendicion.findFirst({
    where: {
      id_inmueble,
      fecha: { lt: fechaActual }, // lt → menos que
    },
    orderBy: { fecha: 'desc' },
    select: { monto_total: true },
  });

  return prevRend ? Number(prevRend.monto_total) : 0;
}



// ========================================================
// GET — Listar todas las rendiciones completas
// ========================================================
export async function GET(req: NextRequest) {
  try {

    const { searchParams } = new URL(req.url);

    const page = Number(searchParams.get("page") ?? 1);
    const pageSize = Number(searchParams.get("pageSize") ?? 5);

    const year = searchParams.get("year");
  const month = searchParams.get("month");
  const cliente = searchParams.get("cliente");

    const skip = (page - 1) * pageSize;

    const where: any = {};

// 👉 Filtro por año / mes (fecha de rendición)
if (year || month) {
  const y = year ? Number(year) : undefined;
  const m = month ? Number(month) - 1 : undefined;

  let desde: Date;
  let hasta: Date;

  if (y && m !== undefined) {
    // Año + mes
    desde = new Date(y, m, 1, 0, 0, 0);
    hasta = new Date(y, m + 1, 1, 0, 0, 0);
  } else if (y) {
    // Solo año
    desde = new Date(y, 0, 1, 0, 0, 0);
    hasta = new Date(y + 1, 0, 1, 0, 0, 0);
  } else {
    // ⚠️ Solo mes → NO filtramos por fecha (porque no sabemos el año)
    desde = null as any;
    hasta = null as any;
  }

  if (desde && hasta) {
    where.fecha = {
      gte: desde,
      lt: hasta,
    };
  }
}

// 👉 Filtro por cliente (a través de cobranzas)
if (cliente) {
  where.cobranzas = {
    some: {
      id_cliente: Number(cliente),
    },
  };
}



   const [rendiciones, total] = await Promise.all([
  db.rendicion.findMany({
    where, // 👈 ACÁ

    skip,
    take: pageSize,

    orderBy: { id_rendicion: "desc" },

    include: {
      inmueble: {
        include: {
          ubicacion: true,
        },
      },

      cobranzas: {
        include: {
          cliente: true,
          recibo: true,
          inmueble: {
            include: {
              ubicacion: true,
            },
          },
        },
      },

      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },

      updatedBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  }),

  db.rendicion.count({ where }), // 👈 Y ACÁ TAMBIÉN
]);


   const mapped = rendiciones.map(r => ({
  id_rendicion: r.id_rendicion,
  fecha: r.fecha,
  monto_total: Number(r.monto_total),

  pagado: r.pagado,


  // ✅ MAPEAR INMUEBLE CORRECTAMENTE
    inmueble: r.inmueble
    ? {
        id_inmueble: r.inmueble.id_inmueble,

        nombre:
          r.inmueble.titulo ??
          `Inmueble ${r.inmueble.id_inmueble}`,

        direccionCompleta: [
          r.inmueble.ubicacion?.direccion,
          r.inmueble.ubicacion?.ciudad,
          r.inmueble.ubicacion?.provincia,
        ]
          .filter(Boolean)
          .join(", "),
      }
    : null,



  cobranzas: r.cobranzas.map(c => ({
      ...c,
      monto: c.monto ? Number(c.monto) : null,
    })),

    createdAt: r.createdAt,
    updatedAt: r.updatedAt,

    // ✅ MAPEAR USUARIO CORRECTAMENTE
    createdBy: r.createdBy
      ? {
          id_usuario: r.createdBy.id,
          nombre: r.createdBy.name || r.createdBy.email,
        }
      : null,

    updatedBy: r.updatedBy
      ? {
          id_usuario: r.updatedBy.id,
          nombre: r.updatedBy.name || r.updatedBy.email,
        }
      : null,
  }));


    return NextResponse.json({
      data: mapped,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });

  } catch (e) {

    console.error("Error en GET /rendiciones:", e);

    return NextResponse.json(
      { error: "No se pudieron obtener las rendiciones" },
      { status: 500 }
    );
  }
}




// ========================================================
// POST — Crear rendición + generar Excel de descarga automática
// ========================================================
export async function POST(req: NextRequest) {
  try {
    // Leemos el JSON enviado desde el frontend
    const { cobranzas, fecha_rendicion, mes_ipc, anio_ipc } = await req.json();

    // Validaciones básicas
    if (!Array.isArray(cobranzas) || cobranzas.length === 0)
      return NextResponse.json({ error: "Seleccioná cobranzas" }, { status: 400 });

    // Convertimos los IDs a número
    const idsCobranzas = cobranzas.map((id: any) => Number(id)).filter(Boolean);

    if (idsCobranzas.length === 0)
      return NextResponse.json({ error: "IDs de cobranzas inválidos" }, { status: 400 });


    // ========================================================
    // Buscar cobranzas válidas
    // (que no estén rendidas y existan)
    // ========================================================
    const seleccionadas = await db.cobranza.findMany({
      where: { id_cobranza: { in: idsCobranzas }, id_rendicion: null },
      include: { 
        cliente: true,
        inmueble: { include: { ubicacion: true } },
        recibo: true,
      },
    });

    if (seleccionadas.length === 0)
      return NextResponse.json(
        { error: "Las cobranzas ya fueron rendidas o no existen" },
        { status: 404 }
      );


    // ========================================================
    // Validar que todas las cobranzas pertenezcan al MISMO inmueble
    // ========================================================
    const inmuebles = [...new Set(seleccionadas.map(c => c.id_inmueble).filter(Boolean))];

    if (inmuebles.length !== 1)
      return NextResponse.json(
        { error: "Las cobranzas deben pertenecer al mismo inmueble" },
        { status: 400 }
      );


    // ========================================================
    // Calcular total de la rendición
    // ========================================================
    const total = seleccionadas.reduce((acc, c) => acc + Number(c.monto ?? 0), 0);

    const totalFinal = Number(total.toFixed(2));


    // ========================================================
    // Calcular número y fecha de rendición
    // ========================================================
    const fecha = fecha_rendicion ? new Date(fecha_rendicion) : new Date();

    const { numero, periodo } = calcularNumeroRendicion(fecha);


    // ========================================================
    // Saldo anterior del inmueble
    // ========================================================
    const saldoAnterior = await calcularSaldoAnterior(inmuebles[0]!, fecha);


    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const userId = session.user.id;

    // MISMO PATRÓN QUE COBRANZAS
    const user =
      (await db.user.findUnique({ where: { id: userId } })) ??
      (await db.user.create({
        data: {
          id: userId,
          name: session.user.name ?? "Usuario",
          email: session.user.email ?? `user_${userId}@example.com`,
        },
      }));

    const rend = await db.rendicion.create({
      data: {
        id_inmueble: inmuebles[0]!,
        fecha,
        monto_total: totalFinal,

        cobranzas: {
          connect: idsCobranzas.map(id => ({ id_cobranza: id })),
        },

        mes_ipc: mes_ipc ?? null,
        anio_ipc: anio_ipc ?? null,

        createdById: user.id,
        updatedById: user.id,
      },

      include: {
        createdBy: true,
        updatedBy: true,
      },
    });



    // ========================================================
    // GENERAR PDFs INDIVIDUALES DE RECIBOS
    // ========================================================
    for (const c of seleccionadas) {
      if (!c.genera_recibo) continue; // si no genera, lo saltamos

      try {
        await generarPDFRecibo({
          id_cobranza: c.id_cobranza,
          monto: Number(c.monto ?? 0),
          total: Number(c.monto ?? 0),
          numero_recibo: c.numero_recibo ?? undefined,
          cliente: {
            nombre: c.cliente?.nombre ?? "",
            email: c.cliente?.email ?? null,
            telefono: c.cliente?.telefono ?? null,
          },
          inmueble: c.inmueble ?? undefined,
        });
      } catch (err) {
        console.error(`Error generando PDF de cobranza ${c.id_cobranza}:`, err);
      }
    }


    // ========================================================
    // PREPARAR DATOS PARA EL EXCEL DE RENDICIÓN
    // ========================================================
    // Obtener IPC real desde la base de datos
    let ipcValor: number | null = null;

    if (mes_ipc && anio_ipc) {

      const ipc = await db.ipc.findFirst({
        where: {
          mes: Number(mes_ipc),
          anio: Number(anio_ipc),
        },
      });

      ipcValor = ipc?.valor ? Number(ipc.valor) : null;


    }


    const cobranzasExcel = seleccionadas.map(c => {
      const montoBase = Number(c.monto ?? 0);
      const totalCobr = c.pagado ? montoBase : 0;
      const aCobrar = montoBase - totalCobr;

      const unFunc =
        c.inmueble
          ? `${c.inmueble.ubicacion?.direccion || ''}: ${c.inmueble.titulo || ''}`
          : '';

      return {
        id_cobranza: c.id_cobranza,
        id_inmueble: c.id_inmueble,
        id_contrato: c.id_contrato,
        cliente: {
          nombre: c.cliente?.nombre ?? "",
          email: c.cliente?.email ?? null,
          telefono: c.cliente?.telefono ?? null,
        },
        inmueble: c.inmueble
          ? {
              titulo: c.inmueble.titulo,
              ubicacion: {
                direccion: c.inmueble.ubicacion?.direccion || '',
              },
            }
          : undefined,

        concepto: c.concepto,
        monto: montoBase,
        fecha_cobranza: c.fecha_cobranza
          ? new Date(c.fecha_cobranza).toISOString().substring(0, 10)
          : '',
        numero_recibo: c.numero_recibo ?? c.recibo?.id_recibo ?? null,
        genera_recibo: c.genera_recibo,
        pagado: c.pagado,
        observaciones: c.observaciones,

        total_cobrar: montoBase,
        total_cobrado: totalCobr,
        a_cobrar: aCobrar,

        unFuncional: unFunc,
        contratoStr: c.id_contrato ? `Contrato ${c.id_contrato}` : '',
        ipcAumento: ipcValor
          ? `IPC ${mes_ipc}/${anio_ipc}`
          : '',

        ipcValor: ipcValor,
      };
    });


    // ========================================================
    // Generar Excel → devuelve un buffer
    // ========================================================
    const buffer = await generarExcelRendicion(
      numero,
      fecha.toISOString().substring(0, 10),
      cobranzasExcel,
      { mes: mes_ipc ?? undefined, anio: anio_ipc ?? undefined, valor: ipcValor },
      saldoAnterior
    );


    // ========================================================
    // Devolver Excel como archivo descargable
    // ========================================================
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename=Rendicion_${rend.id_rendicion}.xlsx`,
      },
    });


  } catch (e: any) {
    console.error("💥 Error en POST /rendiciones:", e);
    return NextResponse.json(
      { error: "Error al registrar la rendición", detail: e.message || String(e) },
      { status: 500 }
    );
  }
}

