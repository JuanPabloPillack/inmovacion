/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/inmuebles/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Prisma } from "@/generated/prisma";
import { auth } from '../../../../auth';

const toNumberOrUndefined = (v: any): number | undefined =>
  v !== undefined && v !== null && v !== "" ? Number(v) : undefined;

const toDecimalOrUndefined = (v: any): Prisma.Decimal | undefined =>
  v !== undefined && v !== null && v !== "" ? new Prisma.Decimal(Number(v)) : undefined;

export async function GET(req: NextRequest) {
  console.log("🔍 GET /api/inmuebles iniciado");

  try {
    const { searchParams } = new URL(req.url);
    const where: any = {};

    const tipo = searchParams.get("tipoId");
    const estado = searchParams.get("estadoId");
    const operacion = searchParams.get("operacionId");
    const precioMin = searchParams.get("precioMin");
    const precioMax = searchParams.get("precioMax");

    console.log("🔎 Parámetros:", { tipo, estado, operacion, precioMin, precioMax });

    if (tipo) where.id_tipo_inmueble = Number(tipo);
    if (estado) where.id_estado = Number(estado);
    if (operacion) where.id_operacion = Number(operacion);

    if (precioMin || precioMax) {
      where.precio = {};
      if (precioMin) where.precio.gte = toDecimalOrUndefined(precioMin);
      if (precioMax) where.precio.lte = toDecimalOrUndefined(precioMax);
    }

    console.log("🧩 WHERE generado:", where);

    const inmuebles = await db.inmueble.findMany({
      where,
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
      orderBy: { id_inmueble: "desc" },
    });

    // DEBUG: Log para verificar relaciones (remover en prod)
    if (inmuebles.length > 0) {
      console.log("🔍 Ejemplo createdBy:", inmuebles[0].createdBy);
      console.log("🔍 Ejemplo updatedBy:", inmuebles[0].updatedBy);
    }

    const formattedInmuebles = inmuebles.map((inmueble) => ({
      ...inmueble,
      createdBy: inmueble.createdBy
        ? {
            id_usuario: inmueble.createdBy.id,
            nombre: inmueble.createdBy.name || inmueble.createdBy.email || 'Usuario desconocido',
          }
        : null,
      updatedBy: inmueble.updatedBy
        ? {
            id_usuario: inmueble.updatedBy.id,
            nombre: inmueble.updatedBy.name || inmueble.updatedBy.email || 'Usuario desconocido',
          }
        : null,
    }));

    console.log("✅ Inmuebles encontrados:", formattedInmuebles.length);

    return NextResponse.json(formattedInmuebles);
  } catch (error: any) {
    console.error("❌ Error GET /api/inmuebles:", error);
    console.error("➡️ Código Prisma:", error.code);
    console.error("➡️ Meta Prisma:", error.meta);
    return NextResponse.json({ error: "Error al obtener inmuebles" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  // FIX: Convertir ID a número
  const userId = Number(session.user.id);
  if (isNaN(userId)) {
    return NextResponse.json({ error: 'ID de usuario inválido' }, { status: 400 });
  }

  console.log("📥 POST /api/inmuebles llamado por usuario ID:", userId);

  try {
    const body = await req.json();
    console.log("📦 Payload recibido:", body);

    // -------------------------
    // VALIDACIÓN CLIENTE
    // -------------------------
    const clienteId =
      body.id_cliente || (body.cliente && typeof body.cliente === "object" ? body.cliente.id : null);

    if (!clienteId) {
      return NextResponse.json({ error: "Debe seleccionar un propietario" }, { status: 400 });
    }

    // -------------------------
    // MANEJO DE BARRIO
    // -------------------------
    let idBarrio: number;

    if (body.id_barrio) {
      idBarrio = Number(body.id_barrio);
    } else if (body.barrio) {
      let barrioDb = await db.barrio.findFirst({ where: { nombre: body.barrio } });

      if (!barrioDb) {
        let localidadId = body.localidadId;

        if (!localidadId) {
          const defaultLocalidad = await db.localidad.findFirst();

          if (!defaultLocalidad) {
            const createdLocalidad = await db.localidad.create({
              data: { nombre: "Localidad por defecto" },
            });

            localidadId = createdLocalidad.id_localidad;
          } else {
            localidadId = defaultLocalidad.id_localidad;
          }
        }

        barrioDb = await db.barrio.create({
          data: {
            nombre: body.barrio,
            id_localidad: Number(localidadId),
          },
        });
      }

      idBarrio = barrioDb.id_barrio;
    } else {
      return NextResponse.json(
        { error: "Debe seleccionar o escribir un barrio" },
        { status: 400 }
      );
    }

    // -------------------------
    // CREACIÓN DEL INMUEBLE
    // -------------------------
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
        createdById: userId,  // FIX: Usar número
        updatedById: userId,  // FIX: Usar número
        tipo_inmueble: body.id_tipo_inmueble
          ? { connect: { id_tipo_inmueble: Number(body.id_tipo_inmueble) } }
          : undefined,
        estado: body.id_estado ? { connect: { id_estado: Number(body.id_estado) } } : undefined,
        cliente: { connect: { id_cliente: Number(clienteId) } },
        operacion: body.id_operacion
          ? { connect: { id_operacion: Number(body.id_operacion) } }
          : undefined,
        ubicacion: {
          create: {
            direccion: body.direccion ?? null,
            ciudad: body.ciudad ?? null,
            provincia: body.provincia ?? null,
            id_barrio: idBarrio,
          },
        },
        foto: body.imagenes?.find((i: any) => i.principal)?.url ?? "/placeholder.jpg",
      },
    });

    // -------------------------
    // IMÁGENES
    // -------------------------
    if (Array.isArray(body.imagenes) && body.imagenes.length > 0) {
      await db.inmuebleImagen.createMany({
        data: body.imagenes.map((img: any) => ({
          url: img.url,
          inmuebleId: inmueble.id_inmueble,
          principal: Boolean(img.principal),
        })),
      });
    }

    // -------------------------
    // RETORNAR INMUEBLE COMPLETO
    // -------------------------
    const creado = await db.inmueble.findUnique({
      where: { id_inmueble: inmueble.id_inmueble },
      include: {
        tipo_inmueble: true,
        estado: true,
        cliente: true,
        operacion: true,
        ubicacion: { include: { barrio: { include: { localidad: true } } } },
        imagenes: true,
        createdBy: { select: { id: true, name: true, email: true } },
        updatedBy: { select: { id: true, name: true, email: true } },
      },
    });

    const formattedCreado = {
      ...creado,
      createdBy: creado?.createdBy
        ? {
            id_usuario: creado.createdBy.id,
            nombre: creado.createdBy.name || creado.createdBy.email || 'Usuario desconocido',
          }
        : null,
      updatedBy: creado?.updatedBy
        ? {
            id_usuario: creado.updatedBy.id,
            nombre: creado.updatedBy.name || creado.updatedBy.email || 'Usuario desconocido',
          }
        : null,
    };

    return NextResponse.json(formattedCreado, { status: 201 });
  } catch (error: any) {
    console.error("❌ Error POST /api/inmuebles:", error);
    return NextResponse.json({ error: error.message || "Error al crear inmueble" }, { status: 500 });
  }
}