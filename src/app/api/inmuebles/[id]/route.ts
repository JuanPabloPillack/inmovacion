
// src/app/api/inmuebles/[id]/route.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { InmuebleDTO } from "@/types/inmuebles";
import { Prisma } from "@/generated/prisma";
import { auth } from "../../../../../auth";

/* -------------------------------------------------------------
   Helpers
---------------------------------------------------------------- */
const toNumberOrUndefined = (v: any): number | undefined =>
  v !== undefined && v !== null && v !== "" && !isNaN(Number(v))
    ? Number(v)
    : undefined;

const toDecimalOrUndefined = (v: any): Prisma.Decimal | undefined =>
  v !== undefined && v !== null && v !== "" && !isNaN(Number(v))
    ? new Prisma.Decimal(Number(v))
    : undefined;

const normalize = (v: any) =>
  v === "" || v === null ? undefined : v;

/* ============================= GET ============================= */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const numId = Number(id);

  if (isNaN(numId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    const inmueble = await db.inmueble.findUnique({
      where: { id_inmueble: numId },
      include: {
        tipo_inmueble: true,
        estado: true,
        operacion: true,
        cliente: true,
        ubicacion: {
          include: {
            barrio: { include: { localidad: true } },
          },
        },
        imagenes: true,
        createdBy: { select: { id: true, name: true, email: true } },
        updatedBy: { select: { id: true, name: true, email: true } },
      },
    });

    if (!inmueble) {
      return NextResponse.json(
        { error: "Inmueble no encontrado" },
        { status: 404 }
      );
    }

    const imagenes = inmueble.imagenes.map((img) => ({
      id: img.id,
      url: img.url,
      inmuebleId: img.inmuebleId,
      principal: Boolean(img.principal),
    }));

    const dto: InmuebleDTO = {
      id_inmueble: inmueble.id_inmueble,
      id_tipo_inmueble: inmueble.id_tipo_inmueble,
      id_ubicacion: inmueble.id_ubicacion,
      id_estado: inmueble.id_estado,
      id_cliente: inmueble.id_cliente,
      id_operacion: inmueble.id_operacion,

      titulo: inmueble.titulo,
      detalles: inmueble.detalles ?? undefined,
      archivado: Boolean(inmueble.archivado),

      precio: inmueble.precio !== null ? Number(inmueble.precio) : null,
      superficie_total: Number(inmueble.superficie_total),
      superficie_cubierta:
        inmueble.superficie_cubierta !== null
          ? Number(inmueble.superficie_cubierta)
          : null,

      cantidad_ambientes: inmueble.cantidad_ambientes,
      cantidad_banos: inmueble.cantidad_banos,
      cantidad_dormitorios: inmueble.cantidad_dormitorios,
      cantidad_cocheras: inmueble.cantidad_cocheras,
      cantidad_pisos: inmueble.cantidad_pisos,
      antiguedad: inmueble.antiguedad,

      foto: inmueble.foto,
      imagenes,
      fotoPrincipal:
        imagenes.find((i) => i.principal)?.url ||
        inmueble.foto ||
        "/placeholder.jpg",

      tipo_inmueble: inmueble.tipo_inmueble,
      estado: inmueble.estado,
      operacion: inmueble.operacion,
      cliente: inmueble.cliente,

      ubicacion: inmueble.ubicacion
    ? {
        id_ubicacion: inmueble.ubicacion.id_ubicacion,
        direccion: inmueble.ubicacion.direccion,
        ciudad: inmueble.ubicacion.ciudad,
        provincia: inmueble.ubicacion.provincia,
        id_barrio: inmueble.ubicacion.id_barrio,

        barrio:
          inmueble.ubicacion.barrio &&
          inmueble.ubicacion.barrio.localidad
            ? {
                id_barrio: inmueble.ubicacion.barrio.id_barrio,
                nombre: inmueble.ubicacion.barrio.nombre,
                id_localidad:
                  inmueble.ubicacion.barrio.localidad.id_localidad,
                localidad: {
                  id_localidad:
                    inmueble.ubicacion.barrio.localidad.id_localidad,
                  nombre:
                    inmueble.ubicacion.barrio.localidad.nombre,
                },
              }
            : undefined,
      }
    : undefined,

      createdAt: inmueble.createdAt?.toISOString(),
      updatedAt: inmueble.updatedAt?.toISOString(),
    };

    return NextResponse.json(dto);
  } catch (error) {
    console.error("❌ Error GET /api/inmuebles/[id]:", error);
    return NextResponse.json(
      { error: "Error al obtener inmueble" },
      { status: 500 }
    );
  }
}

/* ============================= PUT ============================= */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const userId = session.user.id;
  const { id } = await params;
  const numId = Number(id);

  if (isNaN(numId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  const body = await req.json();

  try {
    const result = await db.$transaction(async (tx) => {
      /* ---------------- Inmueble ---------------- */
      const inmueble = await tx.inmueble.update({
        where: { id_inmueble: numId },
        data: {
          titulo: normalize(body.titulo),
          detalles: normalize(body.detalles),

          superficie_total: toDecimalOrUndefined(body.superficie_total),
          superficie_cubierta: toDecimalOrUndefined(body.superficie_cubierta),
          precio: toDecimalOrUndefined(body.precio),

          cantidad_ambientes: toNumberOrUndefined(body.cantidad_ambientes),
          cantidad_banos: toNumberOrUndefined(body.cantidad_banos),
          cantidad_dormitorios: toNumberOrUndefined(body.cantidad_dormitorios),
          cantidad_cocheras: toNumberOrUndefined(body.cantidad_cocheras),
          cantidad_pisos: toNumberOrUndefined(body.cantidad_pisos),
          antiguedad: toNumberOrUndefined(body.antiguedad),

          id_tipo_inmueble: toNumberOrUndefined(body.id_tipo_inmueble),
          id_estado: toNumberOrUndefined(body.id_estado),
          id_operacion: toNumberOrUndefined(body.id_operacion),
          id_cliente: toNumberOrUndefined(body.id_cliente),

          updatedById: userId,
        },
      });

      /* ---------------- Ubicación ---------------- */
      if (
        body.direccion ||
        body.ciudad ||
        body.provincia ||
        body.id_barrio
      ) {
        await tx.ubicacion.update({
          where: { id_ubicacion: inmueble.id_ubicacion },
          data: {
            direccion: normalize(body.direccion),
            ciudad: normalize(body.ciudad),
            provincia: normalize(body.provincia),
            id_barrio: toNumberOrUndefined(body.id_barrio),
          },
        });
      }

      /* ---------------- Imágenes ---------------- */
      if (Array.isArray(body.imagenes)) {
        await tx.inmuebleImagen.deleteMany({
          where: { inmuebleId: numId },
        });

        if (body.imagenes.length > 0) {
          await tx.inmuebleImagen.createMany({
            data: body.imagenes.map((img: any) => ({
              url: img.url,
              principal: Boolean(img.principal),
              inmuebleId: numId,
            })),
          });
        }
      }

      return inmueble;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("❌ Error PUT /api/inmuebles/[id]:", error);
    return NextResponse.json(
      { error: "Error al actualizar inmueble" },
      { status: 500 }
    );
  }
}

/* ============================= DELETE ============================= */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { id } = await params;
  const numId = Number(id);

  if (isNaN(numId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    await db.inmuebleImagen.deleteMany({
      where: { inmuebleId: numId },
    });

    await db.inmueble.delete({
      where: { id_inmueble: numId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("❌ Error DELETE /api/inmuebles/[id]:", error);
    return NextResponse.json(
      { error: "Error al eliminar inmueble" },
      { status: 500 }
    );
  }
}
