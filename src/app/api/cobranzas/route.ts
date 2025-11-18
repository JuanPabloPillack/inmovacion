/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const page = Number(searchParams.get("page") || 1);
    const pageSize = Number(searchParams.get("pageSize") || 10);

    // Normalizador
    const normalize = (v: string | null) => v && v.trim() !== "" ? v : null;

    const anio = normalize(searchParams.get("anio"));
    const mes = normalize(searchParams.get("mes"));

    // Cliente
    const id_cliente_raw = normalize(searchParams.get("cliente"));
    const id_cliente = id_cliente_raw !== null ? Number(id_cliente_raw) : null;

    // si ?sinRendir=1 → buscar solo cobranzas sin rendir
    const sinRendir = searchParams.get("sinRendir") === "1";

    const skip = (page - 1) * pageSize;
    const take = pageSize;

    // -----------------------------------------
    // ARMAR FILTRO WHERE
    // -----------------------------------------
    const where: any = {};

    if (id_cliente !== null) {
      where.id_cliente = id_cliente;
    }

    if (sinRendir) {
      where.id_rendicion = null;
    }

    // FILTRO DE FECHA: mes y año independientes
    if (anio && mes) {
      // Filtrar mes del año seleccionado
      where.fecha_cobranza = {
        gte: new Date(Number(anio), Number(mes) - 1, 1),
        lte: new Date(Number(anio), Number(mes), 0, 23, 59, 59),
      };
    } else if (anio && !mes) {
      // Filtrar todo el año
      where.fecha_cobranza = {
        gte: new Date(Number(anio), 0, 1),
        lte: new Date(Number(anio), 11, 31, 23, 59, 59),
      };
    } else if (!anio && mes) {
      // Filtrar solo mes del año actual
      const currentYear = new Date().getFullYear();
      where.fecha_cobranza = {
        gte: new Date(currentYear, Number(mes) - 1, 1),
        lte: new Date(currentYear, Number(mes), 0, 23, 59, 59),
      };
    }

    // -----------------------------------------
    // CONSULTA A DB
    // -----------------------------------------
    const cobranzas = await db.cobranza.findMany({
      skip,
      take,
      where,
      include: {
        cliente: true,
        inmueble: { include: { ubicacion: true } },
      },
      orderBy: { fecha_cobranza: "desc" },
    });

    const total = await db.cobranza.count({ where });

    // -----------------------------------------
    // MAPEO DE NOMBRE DEL INMUEBLE
    // -----------------------------------------
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


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id_cliente, cobranzas } = body;

    if (!id_cliente || !Array.isArray(cobranzas) || cobranzas.length === 0) {
      return NextResponse.json(
        { error: "Datos incompletos." },
        { status: 400 }
      );
    }

    const created = await Promise.all(
      cobranzas.map(async (c: any) => {
        const contrato = await db.contrato.findUnique({
          where: { id_contrato: Number(c.id_contrato) },
          include: { inmueble: { include: { ubicacion: true } } },
        });

        return db.cobranza.create({
          data: {
            id_cliente: Number(id_cliente),
            id_contrato: Number(c.id_contrato),
            id_inmueble: contrato?.inmueble?.id_inmueble || null,
            monto: Number(c.monto),
            fecha_cobranza: new Date(c.fecha_cobranza),
            medio_pago: c.medio_pago,
            concepto: c.concepto,
            observaciones: c.observaciones || null,
            activa: true,
            // ⚠️ Una cobranza nueva SIEMPRE NO está rendida
            id_rendicion: null,
          },
          include: {
            cliente: true,
            inmueble: { include: { ubicacion: true } },
          },
        });
      })
    );

    const mapped = created.map((c) => ({
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
