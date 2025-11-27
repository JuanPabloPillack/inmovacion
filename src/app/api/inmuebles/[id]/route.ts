//app/api/inmuebles/[id]/route.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { InmuebleDTO } from "@/types/inmuebles";
import { Prisma } from "@/generated/prisma";

// Helpers
const toNumberOrUndefined = (v: any): number | undefined =>
  v !== undefined && v !== null && v !== "" ? Number(v) : undefined;

const toDecimalOrUndefined = (v: any): Prisma.Decimal | undefined =>
  v !== undefined && v !== null && v !== "" ? new Prisma.Decimal(Number(v)) : undefined;

/* -------------------------------------------------------------------------------------------------
   GET → Inmueble con DTO
-------------------------------------------------------------------------------------------------- */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    if (Number.isNaN(id)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

    const inmueble = await db.inmueble.findUnique({
      where: { id_inmueble: id },
      include: {
        tipo_inmueble: true,
        estado: true,
        operacion: true,
        cliente: true,
        ubicacion: { include: { barrio: { include: { localidad: true } } } },
        imagenes: true,
      },
    });

    if (!inmueble)
      return NextResponse.json({ error: "Inmueble no encontrado" }, { status: 404 });

    const imagenes = inmueble.imagenes.map((img: any) => ({
      id: img.id,
      url: img.url,
      inmuebleId: img.inmuebleId,
      principal: Boolean(img.principal),
    }));

    const dto: InmuebleDTO = {
      ...inmueble,
      precio: Number(inmueble.precio),
      superficie_total: Number(inmueble.superficie_total),
      superficie_cubierta: inmueble.superficie_cubierta ? Number(inmueble.superficie_cubierta) : null,
      fotoPrincipal: imagenes.find((i) => i.principal)?.url || inmueble.foto || "/placeholder.jpg",
      archivado: Boolean(inmueble.archivado),
      imagenes,
      estadoNombre: inmueble.estado.nombre.toLowerCase() as "venta" | "alquiler",
    };

    return NextResponse.json(dto);
  } catch (error) {
    console.error("❌ Error GET /inmueble/id:", error);
    return NextResponse.json({ error: "Error al obtener inmueble" }, { status: 500 });
  }
}

/* -------------------------------------------------------------------------------------------------
   PUT → Actualizar inmueble (incluye archivado)
-------------------------------------------------------------------------------------------------- */
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (Number.isNaN(id)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

  let payload: any = {};
  try {
    payload = await req.json();
  } catch (e) {
    // Si no llega JSON, dejamos payload vacío
    payload = {};
  }

  try {
    // Solo actualizar campos que vengan
    const data: Prisma.InmuebleUpdateInput = {
      titulo: payload.titulo ?? undefined,
      superficie_total: toDecimalOrUndefined(payload.superficie_total),
      superficie_cubierta: toDecimalOrUndefined(payload.superficie_cubierta),
      cantidad_ambientes: toNumberOrUndefined(payload.cantidad_ambientes),
      cantidad_banos: toNumberOrUndefined(payload.cantidad_banos),
      cantidad_dormitorios: toNumberOrUndefined(payload.cantidad_dormitorios),
      cantidad_cocheras: toNumberOrUndefined(payload.cantidad_cocheras),
      cantidad_pisos: toNumberOrUndefined(payload.cantidad_pisos),
      antiguedad: toNumberOrUndefined(payload.antiguedad),
      precio: toDecimalOrUndefined(payload.precio),
      detalles: payload.detalles ?? undefined,
      archivado: typeof payload.archivado === "boolean" ? payload.archivado : undefined,
      foto: payload.imagenes?.find((i: any) => i.principal)?.url ?? undefined,
      tipo_inmueble: payload.id_tipo_inmueble ? { connect: { id_tipo_inmueble: Number(payload.id_tipo_inmueble) } } : undefined,
      estado: payload.id_estado ? { connect: { id_estado: Number(payload.id_estado) } } : undefined,
      cliente: payload.id_cliente ? { connect: { id_cliente: Number(payload.id_cliente) } } : undefined,
      operacion: payload.id_operacion ? { connect: { id_operacion: Number(payload.id_operacion) } } : undefined,
    };

    // Actualizar ubicación si viene
    if (payload.id_barrio !== undefined || payload.direccion || payload.ciudad || payload.provincia) {
      data.ubicacion = {
        update: {
          direccion: payload.direccion ?? undefined,
          ciudad: payload.ciudad ?? undefined,
          provincia: payload.provincia ?? undefined,
          id_barrio: toNumberOrUndefined(payload.id_barrio),
        },
      };
    }

    // Actualizar imágenes si vienen
    if (Array.isArray(payload.imagenes)) {
      await db.inmuebleImagen.deleteMany({ where: { inmuebleId: id } });
      await db.inmuebleImagen.createMany({
        data: payload.imagenes.map((img: any) => ({
          url: img.url,
          inmuebleId: id,
          principal: Boolean(img.principal),
        })),
      });
    }

    const actualizado = await db.inmueble.update({
      where: { id_inmueble: id },
      data,
      include: {
        tipo_inmueble: true,
        estado: true,
        cliente: true,
        operacion: true,
        ubicacion: true,
        imagenes: true,
      },
    });

    return NextResponse.json(actualizado);
  } catch (error) {
    console.error("❌ Error PUT /inmueble/id:", error);
    return NextResponse.json({ error: "Error al actualizar inmueble", detalle: String(error) }, { status: 500 });
  }
}
