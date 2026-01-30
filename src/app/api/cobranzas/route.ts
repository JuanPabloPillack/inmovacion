// src/app/api/cobranzas/route.ts

/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/* =============================================================
   ================   MÉTODO GET – LISTAR COBRANZAS   ===========
   ============================================================= */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // Parámetros de paginación (por defecto page=1, pageSize=10)
    const page = Number(searchParams.get("page") || 1);
    const pageSize = Number(searchParams.get("pageSize") || 10);

    // Normaliza valores: si viene "" o null → lo convierte en null real
    const normalize = (v: string | null) =>
      v && v.trim() !== "" ? v : null;

    const anio = normalize(searchParams.get("anio"));
    const mes = normalize(searchParams.get("mes"));

    // Cliente
    const id_cliente_raw = normalize(searchParams.get("cliente"));
    const id_cliente = id_cliente_raw !== null ? Number(id_cliente_raw) : null;

    // Filtro: sinRendir=1 → buscar solo cobranzas que NO estén ligadas a una rendición
    const sinRendir = searchParams.get("sinRendir") === "1";

    const skip = (page - 1) * pageSize;
    const take = pageSize;

    /* ---------------------------------------------------------
       Construcción del filtro dinámico "where" para Prisma
       --------------------------------------------------------- */
    const where: any = {};

    if (id_cliente !== null) {
      where.id_cliente = id_cliente;
    }

    if (sinRendir) {
      where.id_rendicion = null;
    }

    // --- FILTROS POR FECHA (MES y AÑO) ---
    if (anio && mes) {
      // Caso: año + mes → filtro por mes específico del año
      where.fecha_cobranza = {
        gte: new Date(Number(anio), Number(mes) - 1, 1),
        lte: new Date(Number(anio), Number(mes), 0, 23, 59, 59),
      };
    } else if (anio && !mes) {
      // Solo año → 1 de enero a 31 de diciembre
      where.fecha_cobranza = {
        gte: new Date(Number(anio), 0, 1),
        lte: new Date(Number(anio), 11, 31, 23, 59, 59),
      };
    } else if (!anio && mes) {
      // Solo mes → del mes del año actual
      const currentYear = new Date().getFullYear();
      where.fecha_cobranza = {
        gte: new Date(currentYear, Number(mes) - 1, 1),
        lte: new Date(currentYear, Number(mes), 0, 23, 59, 59),
      };
    }

    /* ---------------------------------------------------------
       CONSULTA PRINCIPAL A LA BASE DE DATOS
       --------------------------------------------------------- */
    const cobranzas = await db.cobranza.findMany({
      skip,
      take,
      where,
      include: {
        cliente: true, // trae datos del cliente
        inmueble: { include: { ubicacion: true } }, // trae inmueble + dirección
      },
      orderBy: { fecha_cobranza: "desc" }, // últimas primero
    });

    // Total de resultados para paginación
    const total = await db.cobranza.count({ where });

    /* ---------------------------------------------------------
       MAPEO FINAL: nombre amigable del inmueble
       --------------------------------------------------------- */
    const mapped = cobranzas.map((c) => ({
      ...c,
      inmueble: c.inmueble
        ? {
            ...c.inmueble,
            nombre:
              c.inmueble.titulo +
              (c.inmueble.ubicacion?.direccion
                ? ` - ${c.inmueble.ubicacion.direccion}`
                : ""),
          }
        : null,
    }));

    return NextResponse.json({ cobranzas: mapped, total });
  } catch (error: any) {
    console.error("❌ Error GET cobranzas (REAL):", error);
    return NextResponse.json(
      {
        error: "Error al obtener cobranzas",
        detalle: error.message,
      },
      { status: 500 }
    );
  }
}



/* =============================================================
   =============   MÉTODO POST – CREAR COBRANZAS   =============
   ============================================================= */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { id_cliente, cobranzas } = body;

    // Validaciones mínimas
    if (!id_cliente || !Array.isArray(cobranzas) || cobranzas.length === 0) {
      return NextResponse.json(
        { error: "Datos incompletos." },
        { status: 400 }
      );
    }

    /* ---------------------------------------------------------
       Función robusta para parsear fechas de distintos formatos
       --------------------------------------------------------- */
    const parseFecha = (f: any): Date => {
      if (!f) return new Date(); // fallback: hoy

      // Si ya es Date válida
      if (f instanceof Date && !isNaN(f.getTime())) return f;

      if (typeof f === "string") {
        // Reemplaza "/" por "-" → normaliza strings
        const normalizada = f.replace(/\//g, "-");

        // Prueba YYYY-MM-DD
        const d1 = new Date(normalizada);
        if (!isNaN(d1.getTime())) return d1;

        // Prueba DD-MM-YYYY
        const m = normalizada.match(/^(\d{2})-(\d{2})-(\d{4})$/);
        if (m) {
          const [_, dd, mm, yyyy] = m;
          return new Date(`${yyyy}-${mm}-${dd}T00:00:00`);
        }
      }

      // Último recurso: intentar new Date(f)
      const fallback = new Date(f);
      if (!isNaN(fallback.getTime())) return fallback;

      // Si todo falla → hoy
      return new Date();
    };

    /* ---------------------------------------------------------
       Crear todas las cobranzas en paralelo
       --------------------------------------------------------- */
    const created = await Promise.all(
      cobranzas.map(async (c: any) => {
        // Buscar el contrato y su inmueble asociado
        const contrato = await db.contrato.findUnique({
          where: { id_contrato: Number(c.id_contrato) },
          include: { inmueble: { include: { ubicacion: true } } },
        });

        const fecha = parseFecha(c.fecha_cobranza);

        // Crear la cobranza
        return db.cobranza.create({
          data: {
            id_cliente: Number(id_cliente),
            id_contrato: Number(c.id_contrato),
            id_inmueble: contrato?.inmueble?.id_inmueble || null,
            monto: Number(c.monto),
            fecha_cobranza: fecha,
            medio_pago: c.medio_pago,
            concepto: c.concepto,
            observaciones: c.observaciones || null,
            activa: true,
            id_rendicion: null,
          },
          include: {
            cliente: true,
            inmueble: { include: { ubicacion: true } },
          },
        });
      })
    );

    /* ---------------------------------------------------------
       MAPEO FINAL PARA EL FRONTEND
       --------------------------------------------------------- */
    const mapped = created.map((c) => ({
      ...c, //devolviendo todos los datos de la cobranza
      inmueble: c.inmueble
        ? {
            ...c.inmueble,
            nombre:
              c.inmueble.titulo +
              (c.inmueble.ubicacion?.direccion
                ? ` - ${c.inmueble.ubicacion.direccion}`
                : ""),
          }
        : null,
    }));

    return NextResponse.json(
      { success: true, created: mapped },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("❌ Error POST /cobranzas:", err);
    return NextResponse.json(
      { error: err.message || "Error al crear cobranzas." },
      { status: 500 }
    );
  }
}
