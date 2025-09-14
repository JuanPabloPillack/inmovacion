/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ✅ GET → listar inmuebles con filtros opcionales
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const where: any = {};

    if (searchParams.get("tipo")) {
      where.id_tipo_inmueble = Number(searchParams.get("tipo"));
    }
    if (searchParams.get("estado")) {
      where.id_estado = Number(searchParams.get("estado"));
    }
    if (searchParams.get("precioMin")) {
      where.precio = { gte: Number(searchParams.get("precioMin")) };
    }
    if (searchParams.get("precioMax")) {
      where.precio = { ...where.precio, lte: Number(searchParams.get("precioMax")) };
    }

    const inmuebles = await prisma.inmueble.findMany({
      where,
      include: {
        tipo_inmueble: true,
        estado: true,
        operacion: true,
        cliente: true,
        ubicacion: true,
        imagenes: true,
      },
    });

    return NextResponse.json(inmuebles);
  } catch (error) {
    console.error("❌ Error en GET /api/inmuebles:", error);
    return NextResponse.json({ error: "Error al obtener inmuebles" }, { status: 500 });
  }
}

// ✅ POST → crear inmueble
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Normalizar imágenes
    const imagenesArray = Array.isArray(body.imagenes?.create) ? body.imagenes.create : [];

    const inmueble = await prisma.inmueble.create({
      data: {
        titulo: body.titulo,
        superficie_total: body.superficie_total,
        superficie_cubierta: body.superficie_cubierta,
        cantidad_ambientes: body.cantidad_ambientes,
        antiguedad: body.antiguedad,
        precio: body.precio,
        detalles: body.detalles,

        // relaciones
        tipo_inmueble: { connect: { id_tipo_inmueble: body.tipo_inmueble.connect.id_tipo_inmueble } },
        cliente: { connect: { id_cliente: body.cliente.connect.id_cliente } },
        estado: { connect: { id_estado: body.estado.connect.id_estado } },
        operacion: body.operacion
          ? { connect: { id_operacion: body.operacion.connect.id_operacion } }
          : undefined,
        ubicacion: { connect: { id_ubicacion: body.ubicacion.connect.id_ubicacion } },

        // imágenes opcionales
        imagenes: imagenesArray.length > 0 ? { create: imagenesArray } : undefined,
      },
      include: {
        imagenes: true,
        ubicacion: true,
        tipo_inmueble: true,
        cliente: true,
        estado: true,
        operacion: true,
      },
    });

    return NextResponse.json(inmueble);
  } catch (error: any) {
    console.error("❌ Error en POST /api/inmuebles:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
