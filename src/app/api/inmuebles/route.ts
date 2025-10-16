/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

// 🧩 Helpers
const toNumberOrUndefined = (v: any): number | undefined =>
  v !== undefined && v !== null && v !== "" ? Number(v) : undefined;
const toDecimalOrUndefined = (v: any): Prisma.Decimal | undefined =>
  v !== undefined && v !== null && v !== "" ? new Prisma.Decimal(Number(v)) : undefined;

// ✅ GET → listar inmuebles con filtros opcionales
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const where: any = { archivado: false };

    const tipo = searchParams.get("tipo");
    const estado = searchParams.get("estado");
    const precioMin = searchParams.get("precioMin");
    const precioMax = searchParams.get("precioMax");

    if (tipo) where.id_tipo_inmueble = Number(tipo);
    if (estado) where.id_estado = Number(estado);
    if (precioMin) where.precio = { gte: Number(precioMin) };
    if (precioMax) where.precio = { ...(where.precio || {}), lte: Number(precioMax) };

    const inmuebles = await db.inmueble.findMany({
      where,
      include: {
        tipo_inmueble: true,
        estado: true,
        operacion: true,
        cliente: true,
        ubicacion: { include: { barrio: { include: { localidad: true } } } },
        imagenes: true,
      },
      orderBy: { id_inmueble: "desc" },
    });

    return NextResponse.json(inmuebles);
  } catch (error) {
    console.error("❌ Error GET /api/inmuebles:", error);
    return NextResponse.json({ error: "Error al obtener inmuebles" }, { status: 500 });
  }
}

// 🟢 POST → crear inmueble
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("📦 Payload recibido:", body);

    // ✅ crear ubicación (si corresponde)
    let ubicacionId: number | undefined;
    if (body.direccion || body.ciudad || body.provincia || body.id_barrio) {
      const nuevaUbicacion = await db.ubicacion.create({
        data: {
          direccion: body.direccion ?? null,
          ciudad: body.ciudad ?? null,
          provincia: body.provincia ?? null,
          id_barrio: toNumberOrUndefined(body.id_barrio),
        },
      });
      ubicacionId = nuevaUbicacion.id_ubicacion;
    }

    // ✅ crear inmueble
    const inmueble = await db.inmueble.create({
      data: {
        titulo: body.titulo,
        superficie_total: toDecimalOrUndefined(body.superficie_total),
        superficie_cubierta: toDecimalOrUndefined(body.superficie_cubierta),
        cantidad_ambientes: toNumberOrUndefined(body.cantidad_ambientes),
        cantidad_banos: toNumberOrUndefined(body.cantidad_banos),
        cantidad_dormitorios: toNumberOrUndefined(body.cantidad_dormitorios),
        cantidad_cocheras: toNumberOrUndefined(body.cantidad_cocheras),
        cantidad_pisos: toNumberOrUndefined(body.cantidad_pisos),
        antiguedad: toNumberOrUndefined(body.antiguedad),
        precio: toDecimalOrUndefined(body.precio),
        detalles: body.detalles ?? null,
        archivado: false,

        tipo_inmueble: body.id_tipo_inmueble
          ? { connect: { id_tipo_inmueble: Number(body.id_tipo_inmueble) } }
          : undefined,
        estado: body.id_estado
          ? { connect: { id_estado: Number(body.id_estado) } }
          : undefined,
        cliente: body.id_cliente
          ? { connect: { id_cliente: Number(body.id_cliente) } }
          : undefined,
        operacion: body.id_operacion
          ? { connect: { id_operacion: Number(body.id_operacion) } }
          : undefined,

        ...(ubicacionId ? { id_ubicacion: ubicacionId } : {}),
        foto: body.imagenes?.find((i: any) => i.principal)?.url ?? "/placeholder.jpg",
      },
    });

    // ✅ guardar imágenes
    if (Array.isArray(body.imagenes) && body.imagenes.length > 0) {
      await db.inmuebleImagen.createMany({
        data: body.imagenes.map((img: any) => ({
          url: img.url,
          inmuebleId: inmueble.id_inmueble,
          principal: Boolean(img.principal),
        })),
      });
    }

    const creado = await db.inmueble.findUnique({
      where: { id_inmueble: inmueble.id_inmueble },
      include: {
        tipo_inmueble: true,
        estado: true,
        cliente: true,
        operacion: true,
        ubicacion: { include: { barrio: { include: { localidad: true } } } },
        imagenes: true,
      },
    });

    return NextResponse.json(creado, { status: 201 });
  } catch (error: any) {
    console.error("❌ Error POST /api/inmuebles:", error);
    return NextResponse.json({ error: error.message || "Error al crear inmueble" }, { status: 500 });
  }
}
