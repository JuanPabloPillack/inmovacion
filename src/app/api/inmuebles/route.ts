/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import {prisma} from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Asegurar que imagenes es array
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

        tipo_inmueble: { connect: { id_tipo_inmueble: body.tipo_inmueble.connect.id_tipo_inmueble } },
        cliente: { connect: { id_cliente: body.cliente.connect.id_cliente } },
        estado: { connect: { id_estado: body.estado.connect.id_estado } },
        operacion: body.operacion ? { connect: { id_operacion: body.operacion.connect.id_operacion } } : undefined,
        ubicacion: { connect: { id_ubicacion: body.ubicacion.connect.id_ubicacion } },

        imagenes: imagenesArray.length > 0 ? { create: imagenesArray } : undefined,
      },
      include: { imagenes: true, ubicacion: true, tipo_inmueble: true, cliente: true, estado: true, operacion: true },
    });

    return NextResponse.json(inmueble);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
