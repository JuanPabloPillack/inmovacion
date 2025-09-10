/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      id_tipo_inmueble,
      id_estado,
      id_cliente,
      id_operacion,
      superficie_total,
      superficie_cubierta,
      cantidad_ambientes,
      antiguedad,
      precio,
      detalles,
      direccion,
      ciudad,
      provincia,
      barrio: nombreBarrio,
      imagenes,
    } = body;

    if (!id_tipo_inmueble || !id_estado || !id_cliente || !id_operacion || !superficie_total || !direccion || !nombreBarrio) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
    }

    let barrioId: number | null = null;
    const barrioExistente = await prisma.barrio.findFirst({ where: { nombre: nombreBarrio } });

    if (barrioExistente) {
      barrioId = barrioExistente.id_barrio;
    } else {
      const barrioNuevo = await prisma.barrio.create({ data: { nombre: nombreBarrio, id_localidad: 1 } });
      barrioId = barrioNuevo.id_barrio;
    }

    const ubicacion = await prisma.ubicacion.create({
      data: { direccion, ciudad: ciudad ?? null, provincia: provincia ?? null, id_barrio: barrioId },
    });

    const tipoInmueble = await prisma.tipo_inmueble.findUnique({ where: { id_tipo_inmueble } });
    if (!tipoInmueble) return NextResponse.json({ error: "Tipo de inmueble no encontrado" }, { status: 400 });

    const titulo = `${tipoInmueble.nombre} en ${direccion}`;

    const inmueble = await prisma.inmueble.create({
      data: {
        id_tipo_inmueble,
        id_ubicacion: ubicacion.id_ubicacion,
        id_estado,
        id_cliente,
        id_operacion,
        superficie_total,
        superficie_cubierta: superficie_cubierta ?? null,
        cantidad_ambientes: cantidad_ambientes ?? null,
        antiguedad: antiguedad ?? null,
        precio: precio ?? null,
        detalles: detalles ?? null,
        titulo,
        imagenes: imagenes && imagenes.length > 0 ? { create: imagenes.map((img: { url: string; principal: boolean }) => ({ url: img.url, principal: img.principal })) } : undefined,
      },
      include: { imagenes: true },
    });

    return NextResponse.json(inmueble, { status: 201 });
  } catch (error: any) {
    console.error("🔥 Error al crear inmueble:", error);
    return NextResponse.json({ error: error.message || "Error interno al crear inmueble" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    // Leer filtros de query params
    const tipoId = searchParams.get("tipo") ? Number(searchParams.get("tipo")) : undefined;
    const estadoId = searchParams.get("estado") ? Number(searchParams.get("estado")) : undefined;
    const precioMin = searchParams.get("precioMin") ? Number(searchParams.get("precioMin")) : undefined;
    const precioMax = searchParams.get("precioMax") ? Number(searchParams.get("precioMax")) : undefined;

    const where: any = {};

    if (tipoId) where.id_tipo_inmueble = tipoId;
    if (estadoId) where.id_estado = estadoId;
    if (precioMin !== undefined || precioMax !== undefined) {
      where.precio = {};
      if (precioMin !== undefined) where.precio.gte = precioMin;
      if (precioMax !== undefined) where.precio.lte = precioMax;
    }

    const inmuebles = await prisma.inmueble.findMany({
      where,
      include: {
        tipo_inmueble: true,
        ubicacion: { include: { barrio: { include: { localidad: true } } } },
        estado: true,
        cliente: true,
        imagenes: true,
      },
    });

    return NextResponse.json(inmuebles);
  } catch (error: any) {
    console.error("🔥 Error al obtener inmuebles:", error);
    return NextResponse.json({ error: error.message || "Error interno al obtener inmuebles" }, { status: 500 });
  }
}
