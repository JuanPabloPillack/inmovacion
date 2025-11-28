// src/app/api/inmuebles/route.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Prisma } from "@/generated/prisma";
import { auth } from "../../../../auth";

/* -------------------------------------------------------------
   Helpers
---------------------------------------------------------------- */
const toNumberOrUndefined = (v: any): number | undefined =>
  v !== undefined && v !== null && v !== "" && !isNaN(Number(v))
    ? Number(v)
    : undefined;

const toDecimalOrUndefined = (v: any): Prisma.Decimal | undefined =>
  v !== undefined &&
  v !== null &&
  v !== "" &&
  !isNaN(Number(v))
    ? new Prisma.Decimal(Number(v))
    : undefined;

/* =============================================================
   🚀 GET /api/inmuebles
=============================================================== */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const where: any = {};

    const tipo = searchParams.get("tipoId");
    const estado = searchParams.get("estadoId");
    const operacion = searchParams.get("operacionId");
    const precioMin = searchParams.get("precioMin");
    const precioMax = searchParams.get("precioMax");

    if (tipo) where.id_tipo_inmueble = Number(tipo);
    if (estado) where.id_estado = Number(estado);
    if (operacion) where.id_operacion = Number(operacion);

    if (precioMin || precioMax) {
      where.precio = {};
      if (precioMin) where.precio.gte = toDecimalOrUndefined(precioMin);
      if (precioMax) where.precio.lte = toDecimalOrUndefined(precioMax);
    }

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

    const formattedInmuebles = inmuebles.map((inmueble) => ({
      ...inmueble,
      superficie_total: Number(inmueble.superficie_total),
      superficie_cubierta:
        inmueble.superficie_cubierta != null
          ? Number(inmueble.superficie_cubierta)
          : null,
      precio: inmueble.precio != null ? Number(inmueble.precio) : null,
      createdBy: inmueble.createdBy
        ? { id: inmueble.createdBy.id, name: inmueble.createdBy.name || inmueble.createdBy.email }
        : null,
      updatedBy: inmueble.updatedBy
        ? { id: inmueble.updatedBy.id, name: inmueble.updatedBy.name || inmueble.updatedBy.email }
        : null,
      createdAt: inmueble.createdAt?.toISOString(),
      updatedAt: inmueble.updatedAt?.toISOString(),
    }));

    return NextResponse.json(formattedInmuebles);
  } catch (error: any) {
    console.error("❌ Error GET /api/inmuebles:", error);
    return NextResponse.json({ error: "Error al obtener inmuebles" }, { status: 500 });
  }
}

/* =============================================================
   🚀 POST /api/inmuebles (mejorado, con validación de usuario)
=============================================================== */
export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    // ✅ Validar que el usuario exista en la DB
    let user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      // En desarrollo podemos crear un usuario por defecto
      user = await db.user.create({
        data: {
          id: userId,
          name: session.user.name ?? "Usuario Dev",
          email: session.user.email ?? `dev_${userId}@example.com`,
        },
      });
    }

    const body = await req.json();

    /* -------------------- Validaciones -------------------- */
    const clienteId =
      body.id_cliente ||
      (body.cliente && typeof body.cliente === "object" ? body.cliente.id : null);

    if (!clienteId) return NextResponse.json({ error: "Debe seleccionar un propietario" }, { status: 400 });
    if (!body.id_tipo_inmueble) return NextResponse.json({ error: "Debe seleccionar un tipo de inmueble" }, { status: 400 });
    if (!body.id_estado) return NextResponse.json({ error: "Debe seleccionar un estado" }, { status: 400 });

    /* -------------------- Crear o Buscar Barrio -------------------- */
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
            const createdLocalidad = await db.localidad.create({ data: { nombre: "Localidad por defecto" } });
            localidadId = createdLocalidad.id_localidad;
          } else {
            localidadId = defaultLocalidad.id_localidad;
          }
        }

        barrioDb = await db.barrio.create({ data: { nombre: body.barrio, id_localidad: Number(localidadId) } });
      }

      idBarrio = barrioDb.id_barrio;
    } else {
      return NextResponse.json({ error: "Debe seleccionar o escribir un barrio" }, { status: 400 });
    }

    /* -------------------- Crear Ubicación -------------------- */
    const ubicacion = await db.ubicacion.create({
      data: {
        direccion: body.direccion ?? null,
        ciudad: body.ciudad ?? null,
        provincia: body.provincia ?? null,
        id_barrio: idBarrio,
      },
    });

    /* -------------------- Validaciones de campos numéricos -------------------- */
    const superficie_total = toDecimalOrUndefined(body.superficie_total);
    if (!superficie_total) return NextResponse.json({ error: "Superficie total inválida" }, { status: 400 });

    const superficie_cubierta = toDecimalOrUndefined(body.superficie_cubierta);
    const precio = toDecimalOrUndefined(body.precio);

    /* -------------------- Crear Inmueble -------------------- */
    const inmueble = await db.inmueble.create({
      data: {
        titulo: body.titulo,
        superficie_total,
        superficie_cubierta: superficie_cubierta ?? null,
        cantidad_ambientes: toNumberOrUndefined(body.cantidad_ambientes),
        cantidad_banos: toNumberOrUndefined(body.cantidad_banos),
        cantidad_dormitorios: toNumberOrUndefined(body.cantidad_dormitorios),
        cantidad_cocheras: toNumberOrUndefined(body.cantidad_cocheras),
        cantidad_pisos: toNumberOrUndefined(body.cantidad_pisos),
        antiguedad: toNumberOrUndefined(body.antiguedad),
        precio: precio ?? null,
        detalles: body.detalles ?? null,
        archivado: false,
        createdById: userId,
        updatedById: userId,
        id_tipo_inmueble: Number(body.id_tipo_inmueble),
        id_estado: Number(body.id_estado),
        id_cliente: Number(clienteId),
        id_operacion: body.id_operacion ? Number(body.id_operacion) : null,
        id_ubicacion: ubicacion.id_ubicacion,
        foto: body.imagenes?.find((i: any) => i.principal)?.url ?? "/placeholder.jpg",
      },
    });

    /* -------------------- Crear imágenes (si existen) -------------------- */
    if (Array.isArray(body.imagenes) && body.imagenes.length > 0) {
      const imagenesValidas = body.imagenes.filter((img: any) => img.url);
      if (imagenesValidas.length > 0) {
        await db.inmuebleImagen.createMany({
          data: imagenesValidas.map((img: any) => ({
            url: img.url,
            inmuebleId: inmueble.id_inmueble,
            principal: Boolean(img.principal),
          })),
        });
      }
    }

    /* -------------------- Recuperar inmueble completo -------------------- */
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

    if (!creado) throw new Error("Error al recuperar el inmueble creado");

    const formattedCreado = {
      ...creado,
      superficie_total: Number(creado.superficie_total),
      superficie_cubierta: creado.superficie_cubierta ? Number(creado.superficie_cubierta) : null,
      precio: creado.precio ? Number(creado.precio) : null,
      createdBy: creado.createdBy
        ? { id: creado.createdBy.id, name: creado.createdBy.name || creado.createdBy.email || "Usuario desconocido" }
        : null,
      updatedBy: creado.updatedBy
        ? { id: creado.updatedBy.id, name: creado.updatedBy.name || creado.updatedBy.email || "Usuario desconocido" }
        : null,
      createdAt: creado.createdAt?.toISOString(),
      updatedAt: creado.updatedAt?.toISOString(),
    };

    return NextResponse.json(formattedCreado, { status: 201 });
  } catch (error: any) {
    console.error("❌ Error POST /api/inmuebles:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    return NextResponse.json({ error: error.message || "Error al crear inmueble" }, { status: 500 });
  }
}
