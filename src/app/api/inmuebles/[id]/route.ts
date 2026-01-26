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
        ubicacion: { include: { barrio: { include: { localidad: true } } } },
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

      precio: inmueble.precio != null ? Number(inmueble.precio) : null,
      superficie_total: Number(inmueble.superficie_total),
      superficie_cubierta:
        inmueble.superficie_cubierta != null
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
            barrio: inmueble.ubicacion.barrio
        ? {
            id_barrio: inmueble.ubicacion.barrio.id_barrio,
            nombre: inmueble.ubicacion.barrio.nombre,
            id_localidad: inmueble.ubicacion.barrio.id_localidad,
            localidad: {
              id_localidad:
                inmueble.ubicacion.barrio.localidad.id_localidad,
              nombre:
                inmueble.ubicacion.barrio.localidad.nombre,
            },
          }
        : null,

          }
        : undefined,

      estadoNombre: inmueble.estado?.nombre.toLowerCase() as
        | "venta"
        | "alquiler",

      createdAt: inmueble.createdAt?.toISOString(),
      updatedAt: inmueble.updatedAt?.toISOString(),

      createdBy: inmueble.createdBy
        ? {
            id_usuario: String(inmueble.createdBy.id),
            nombre:
              inmueble.createdBy.name ||
              inmueble.createdBy.email ||
              "Usuario desconocido",
          }
        : undefined,

      updatedBy: inmueble.updatedBy
        ? {
            id_usuario: String(inmueble.updatedBy.id),
            nombre:
              inmueble.updatedBy.name ||
              inmueble.updatedBy.email ||
              "Usuario desconocido",
          }
        : undefined,
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

  await db.user.upsert({
    where: { id: userId },
    update: {},
    create: {
      id: userId,
      name: session.user.name ?? "Usuario",
      email: session.user.email!,
    },
  });

  const { id } = await params;
  const numId = Number(id);

  if (isNaN(numId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  const existente = await db.inmueble.findUnique({
    where: { id_inmueble: numId },
  });

  if (!existente) {
    return NextResponse.json(
      { error: "Inmueble no encontrado" },
      { status: 404 }
    );
  }

  
let payload: any = {};
try {
  const raw = await req.json();

  payload = {
    ...raw,
    titulo: normalize(raw.titulo),
    detalles: normalize(raw.detalles),
    superficie_total: normalize(raw.superficie_total),
    superficie_cubierta: normalize(raw.superficie_cubierta),
    precio: normalize(raw.precio),
    cantidad_ambientes: normalize(raw.cantidad_ambientes),
    cantidad_banos: normalize(raw.cantidad_banos),
    cantidad_dormitorios: normalize(raw.cantidad_dormitorios),
    cantidad_cocheras: normalize(raw.cantidad_cocheras),
    cantidad_pisos: normalize(raw.cantidad_pisos),
    antiguedad: normalize(raw.antiguedad),
    direccion: normalize(raw.direccion),
    ciudad: normalize(raw.ciudad),
    provincia: normalize(raw.provincia),
    id_barrio: normalize(raw.id_barrio),
    id_cliente: normalize(raw.id_cliente),
    id_tipo_inmueble: normalize(raw.id_tipo_inmueble),
    id_operacion: normalize(raw.id_operacion),
    id_estado: normalize(raw.id_estado),
  };
} catch {}


  if (!payload || Object.keys(payload).length === 0) {
    return NextResponse.json(
      { error: "No hay datos para actualizar" },
      { status: 400 }
    );
  }

  /* -------- VALIDACIONES NUMÉRICAS -------- */
  if (
    payload.superficie_total !== undefined &&
    Number(payload.superficie_total) <= 0
  ) {
    return NextResponse.json(
      { error: "La superficie total debe ser mayor a 0" },
      { status: 400 }
    );
  }

  if (
    payload.superficie_cubierta !== undefined &&
    payload.superficie_total !== undefined &&
    Number(payload.superficie_cubierta) > Number(payload.superficie_total)
  ) {
    return NextResponse.json(
      { error: "La superficie cubierta no puede ser mayor a la total" },
      { status: 400 }
    );
  }

  if (payload.precio !== undefined && Number(payload.precio) < 0) {
    return NextResponse.json(
      { error: "El precio no puede ser negativo" },
      { status: 400 }
    );
  }

  /* -------- VALIDAR RELACIONES -------- */
  if (payload.id_cliente) {
    const cliente = await db.cliente.findUnique({
      where: { id_cliente: Number(payload.id_cliente) },
    });
    if (!cliente)
      return NextResponse.json({ error: "Cliente inválido" }, { status: 400 });
  }

  if (payload.id_tipo_inmueble) {
    const tipo = await db.tipo_inmueble.findUnique({
      where: { id_tipo_inmueble: Number(payload.id_tipo_inmueble) },
    });
    if (!tipo)
      return NextResponse.json(
        { error: "Tipo de inmueble inválido" },
        { status: 400 }
      );
  }

  if (payload.id_operacion) {
    const op = await db.operacion.findUnique({
      where: { id_operacion: Number(payload.id_operacion) },
    });
    if (!op)
      return NextResponse.json(
        { error: "Operación inválida" },
        { status: 400 }
      );
  }

  if (payload.id_barrio !== undefined) {
    const barrio = await db.barrio.findUnique({
      where: { id_barrio: Number(payload.id_barrio) },
    });
    if (!barrio)
      return NextResponse.json({ error: "Barrio inválido" }, { status: 400 });
  }

  /* -------- IMÁGENES -------- */
  if (Array.isArray(payload.imagenes)) {
    const principales = payload.imagenes.filter((i: any) => i.principal);
    if (principales.length > 1) {
      return NextResponse.json(
        { error: "Solo puede haber una imagen principal" },
        { status: 400 }
      );
    }
    if (payload.imagenes.length > 0 && principales.length === 0) {
      payload.imagenes[0].principal = true;
    }
  }

  /* -------- ESTADO / ARCHIVADO -------- */
  let archivadoFinal: boolean | undefined;
  let estadoFinalId: number | undefined;

  if (typeof payload.archivado === "boolean") {
    archivadoFinal = payload.archivado;
    if (payload.archivado === false) {
      const estadoDisponible = await db.estado.findFirst({
        where: { nombre: "Disponible" },
      });
      if (!estadoDisponible) {
        return NextResponse.json(
          { error: "No existe el estado 'Disponible'" },
          { status: 500 }
        );
      }
      estadoFinalId = estadoDisponible.id_estado;
    }
  } else if (payload.id_estado) {
    const estadoDb = await db.estado.findUnique({
      where: { id_estado: Number(payload.id_estado) },
    });
    if (!estadoDb) {
      return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
    }
    archivadoFinal = estadoDb.nombre.toLowerCase() !== "disponible";
    estadoFinalId = estadoDb.id_estado;
  }

  try {
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

      updatedBy: { connect: { id: userId } },

      ...(archivadoFinal !== undefined && { archivado: archivadoFinal }),
      ...(estadoFinalId && {
        estado: { connect: { id_estado: estadoFinalId } },
      }),

      foto:
        payload.imagenes?.find((i: any) => i.principal)?.url ?? undefined,

      tipo_inmueble: payload.id_tipo_inmueble
        ? { connect: { id_tipo_inmueble: Number(payload.id_tipo_inmueble) } }
        : undefined,

      cliente: payload.id_cliente
        ? { connect: { id_cliente: Number(payload.id_cliente) } }
        : undefined,

      operacion: payload.id_operacion
        ? { connect: { id_operacion: Number(payload.id_operacion) } }
        : undefined,
    };

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

    if (Array.isArray(payload.imagenes)) {
      await db.inmuebleImagen.deleteMany({
        where: { inmuebleId: numId },
      });

      if (payload.imagenes.length > 0) {
        await db.inmuebleImagen.createMany({
          data: payload.imagenes.map((img: any) => ({
            url: img.url,
            inmuebleId: numId,
            principal: Boolean(img.principal),
          })),
        });
      }
    }

    const actualizado = await db.inmueble.update({
      where: { id_inmueble: numId },
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

    return NextResponse.json(actualizado);
  } catch (error) {
    console.error("❌ Error PUT /api/inmuebles/[id]:", error);
    return NextResponse.json(
      { error: "Error al actualizar inmueble", detalle: String(error) },
      { status: 500 }
    );
  }
}
