// app/api/inmuebles/[id]/route.ts

/* eslint-disable @typescript-eslint/no-explicit-any */
// Se desactiva la regla que prohíbe usar "any" para simplificar validaciones y payloads

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";                              // Prisma Client
import type { InmuebleDTO } from "@/types/inmuebles";       // Tipo del DTO final que devolverá el GET
import { Prisma } from "@/generated/prisma";                // Para tipos y Decimal

/* -------------------------------------------------------------------------------------------------
   Helpers para transformar valores del payload
-------------------------------------------------------------------------------------------------- */

// Convierte un valor a número o undefined si viene vacío
const toNumberOrUndefined = (v: any): number | undefined =>
  v !== undefined && v !== null && v !== "" ? Number(v) : undefined;

// Igual que el anterior pero para valores DECIMAL de Prisma
const toDecimalOrUndefined = (v: any): Prisma.Decimal | undefined =>
  v !== undefined && v !== null && v !== "" ? new Prisma.Decimal(Number(v)) : undefined;

/* -------------------------------------------------------------------------------------------------
   GET → Obtiene un inmueble por ID y lo transforma a un DTO perfecto para el frontend
-------------------------------------------------------------------------------------------------- */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    // Se convierte el ID de la URL a número
    const id = Number(params.id);

    // Si el ID no es válido envio un error 400
    if (Number.isNaN(id))
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });

    // Busca el inmueble en la BD incluyendo todas las relaciones necesarias
    const inmueble = await db.inmueble.findUnique({
      where: { id_inmueble: id },
      include: {
        tipo_inmueble: true,
        estado: true,
        operacion: true,
        cliente: true,
        ubicacion: { include: { barrio: { include: { localidad: true } } } },
        imagenes: true,
        createdBy: { select: { id: true, name: true, email: true } },
        updatedBy: { select: { id: true, name: true, email: true } },
      },
    });

    // Si no existe, se responde error 404
    if (!inmueble)
      return NextResponse.json({ error: "Inmueble no encontrado" }, { status: 404 });

    // Asegura que las imágenes estén formateadas correctamente
    const imagenes = inmueble.imagenes.map((img: any) => ({
      id: img.id,
      url: img.url,
      inmuebleId: img.inmuebleId,
      principal: Boolean(img.principal),
    }));

    // Construye el DTO final para enviar al frontend
    const dto: InmuebleDTO = {
      ...inmueble,

      // Se convierten Decimals a números
      precio: inmueble.precio != null ? Number(inmueble.precio) : null,
      superficie_total: Number(inmueble.superficie_total),
      superficie_cubierta:
        inmueble.superficie_cubierta != null
          ? Number(inmueble.superficie_cubierta)
          : null,

      // Foto principal tomada de las imágenes o fallback
      fotoPrincipal:
        imagenes.find((i) => i.principal)?.url || inmueble.foto || "/placeholder.jpg",

      // Campos que Prisma devuelve como Decimal o boolean vienen normalizados
      archivado: Boolean(inmueble.archivado),
      imagenes,

      // Normalización de string
      estadoNombre: inmueble.estado?.nombre.toLowerCase() as "venta" | "alquiler",

      // Convertimos fechas a ISO string
      createdAt: inmueble.createdAt?.toISOString() || undefined,
      updatedAt: inmueble.updatedAt?.toISOString() || undefined,

      // Info del usuario creador
      createdBy: inmueble.createdBy
        ? {
            id_usuario: String(inmueble.createdBy.id),
            nombre:
              inmueble.createdBy.name ||
              inmueble.createdBy.email ||
              "Usuario desconocido",
          }
        : undefined,

      // Info del usuario actualizador
      updatedBy: inmueble.updatedBy
        ? {
            id_usuario: String(inmueble.updatedBy.id),
            nombre:
              inmueble.updatedBy.name ||
              inmueble.updatedBy.email ||
              "Usuario desconocido",
          }
        : undefined,

      detalles: inmueble.detalles ?? undefined,
    };

    // Se devuelve el DTO final
    return NextResponse.json(dto);

  } catch (error) {
    console.error("❌ Error GET /inmueble/id:", error);
    return NextResponse.json(
      { error: "Error al obtener inmueble" },
      { status: 500 }
    );
  }
}

/* -------------------------------------------------------------------------------------------------
   PUT → Actualiza un inmueble y también gestiona su archivado y sus imágenes
-------------------------------------------------------------------------------------------------- */
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);

  // Validación de ID
  if (Number.isNaN(id))
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });

  let payload: any = {};

  // Intentamos leer el JSON, si falla dejamos payload vacío
  try {
    payload = await req.json();
  } catch (e) {
    payload = {};
  }

  try {
    // Armamos el objeto de actualización utilizando helpers
    const data: Prisma.InmuebleUpdateInput = {
      titulo: payload.titulo ?? undefined,

      // Convertimos valores opcionales
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

      // Archivado sólo si vino un boolean real
      archivado:
        typeof payload.archivado === "boolean" ? payload.archivado : undefined,

      // Establece la foto principal
      foto: payload.imagenes?.find((i: any) => i.principal)?.url ?? undefined,

      // Relación con otras tablas
      tipo_inmueble: payload.id_tipo_inmueble
        ? { connect: { id_tipo_inmueble: Number(payload.id_tipo_inmueble) } }
        : undefined,

      estado: payload.id_estado
        ? { connect: { id_estado: Number(payload.id_estado) } }
        : undefined,

      cliente: payload.id_cliente
        ? { connect: { id_cliente: Number(payload.id_cliente) } }
        : undefined,

      operacion: payload.id_operacion
        ? { connect: { id_operacion: Number(payload.id_operacion) } }
        : undefined,
    };

    // Si vienen datos de ubicación, actualizamos la relación 1:1
    if (
      payload.id_barrio !== undefined ||
      payload.direccion ||
      payload.ciudad ||
      payload.provincia
    ) {
      data.ubicacion = {
        update: {
          direccion: payload.direccion ?? undefined,
          ciudad: payload.ciudad ?? undefined,
          provincia: payload.provincia ?? undefined,
          id_barrio: toNumberOrUndefined(payload.id_barrio),
        },
      };
    }

    // Si vienen imágenes nuevas, se borran las anteriores y se vuelven a crear
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

    // Ejecuta la actualización y trae todas las relaciones
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
        createdBy: { select: { id: true, name: true, email: true } },
        updatedBy: { select: { id: true, name: true, email: true } },
      },
    });

    // Respuesta final con el inmueble actualizado
    return NextResponse.json(actualizado);

  } catch (error) {
    console.error("❌ Error PUT /inmueble/id:", error);
    return NextResponse.json(
      { error: "Error al actualizar inmueble", detalle: String(error) },
      { status: 500 }
    );
  }
}
