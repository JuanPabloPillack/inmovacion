/// src/app/api/inmuebles/route.ts
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
  v !== undefined && v !== null && v !== "" && !isNaN(Number(v))
    ? new Prisma.Decimal(Number(v))
    : undefined;

/* =============================================================
   🚀 GET /api/inmuebles (OPTIMIZADO)
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

    const page = Number(searchParams.get("page") ?? 1);
    const pageSize = Number(searchParams.get("pageSize") ?? 20);

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
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { id_inmueble: "desc" },
      select: {
        id_inmueble: true,
        titulo: true,

        superficie_total: true,
        superficie_cubierta: true,
        precio: true,

        cantidad_ambientes: true,
        cantidad_banos: true,
        cantidad_dormitorios: true,
        cantidad_cocheras: true,
        cantidad_pisos: true,
        antiguedad: true,

        archivado: true,
        createdAt: true,
        updatedAt: true,

        tipo_inmueble: { select: { id_tipo_inmueble: true, nombre: true } },
        estado: { select: { id_estado: true, nombre: true } },
        operacion: { select: { id_operacion: true, nombre: true } },

        cliente: { select: { id_cliente: true, nombre: true } },
        
        ubicacion: {
          select: {
            direccion: true,
            ciudad: true,
            provincia: true,
            barrio: {
              select: {
                nombre: true,
                localidad: {
                  select: {
                    nombre: true,
                  },
                },
              },
            },
          },
        },

        imagenes: {
          select: { url: true, principal: true },
        },

        createdBy: { select: { id: true, name: true, email: true } },
        updatedBy: { select: { id: true, name: true, email: true } },
      },
    });

    const formatted = inmuebles.map((i) => ({
      ...i,
      superficie_total: Number(i.superficie_total),
      superficie_cubierta: i.superficie_cubierta
        ? Number(i.superficie_cubierta)
        : null,
      precio: i.precio ? Number(i.precio) : null,
      createdBy: i.createdBy
        ? {
            id_usuario: String(i.createdBy.id),
            nombre:
              i.createdBy.name ||
              i.createdBy.email ||
              "Usuario desconocido",
          }
        : undefined,
      updatedBy: i.updatedBy
        ? {
            id_usuario: String(i.updatedBy.id),
            nombre:
              i.updatedBy.name ||
              i.updatedBy.email ||
              "Usuario desconocido",
          }
        : undefined,
      createdAt: i.createdAt?.toISOString(),
      updatedAt: i.updatedAt?.toISOString(),
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("❌ Error GET /api/inmuebles:", error);
    return NextResponse.json(
      { error: "Error al obtener inmuebles" },
      { status: 500 }
    );
  }
}

/* =============================================================
   🚀 POST /api/inmuebles (CON VALIDACIONES COMPLETAS)
=============================================================== */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const body = await req.json();

    const result = await db.$transaction(async (tx) => {
      /* ---------- Usuario ---------- */
      const user =
        (await tx.user.findUnique({ where: { id: userId } })) ??
        (await tx.user.create({
          data: {
            id: userId,
            name: session.user.name ?? "Usuario Dev",
            email: session.user.email ?? `dev_${userId}@example.com`,
          },
        }));

      /* ---------- VALIDACIONES GENERALES ---------- */
      const clienteId =
        body.id_cliente ||
        (body.cliente && typeof body.cliente === "object"
          ? body.cliente.id
          : null);

      if (!clienteId) throw new Error("Debe seleccionar un propietario");
      if (!body.id_tipo_inmueble) throw new Error("Debe seleccionar un tipo");
      if (!body.id_estado) throw new Error("Debe seleccionar un estado");
      if (!body.id_operacion)
        throw new Error("Debe seleccionar una operación");

      if (!body.titulo || body.titulo.trim().length < 5)
        throw new Error(
          "El título es obligatorio y debe tener al menos 5 caracteres"
        );

      if (body.titulo.length > 150)
        throw new Error("El título no puede superar los 150 caracteres");

      if (!body.direccion || body.direccion.trim() === "")
        throw new Error("La dirección es obligatoria");

      if (!body.barrio || body.barrio.trim() === "")
        throw new Error("El barrio es obligatorio");

      /* ---------- VALIDACIONES NUMÉRICAS ---------- */
      const supTotal = Number(body.superficie_total);
      if (isNaN(supTotal) || supTotal <= 0)
        throw new Error("La superficie total debe ser mayor a 0");

      const supCub =
        body.superficie_cubierta !== undefined &&
        body.superficie_cubierta !== null &&
        body.superficie_cubierta !== ""
          ? Number(body.superficie_cubierta)
          : null;

      if (supCub !== null && (isNaN(supCub) || supCub < 0))
        throw new Error("La superficie cubierta no puede ser negativa");

      if (supCub !== null && supCub > supTotal)
        throw new Error(
          "La superficie cubierta no puede superar la superficie total"
        );

      const precio = Number(body.precio);
      if (isNaN(precio) || precio <= 0)
        throw new Error("El precio debe ser mayor a 0");

      /* ---------- Estado ---------- */
      const estadoDb = await tx.estado.findUnique({
        where: { id_estado: Number(body.id_estado) },
      });

      if (!estadoDb) throw new Error("Estado inválido");

      const archivado =
        estadoDb.nombre.toLowerCase() !== "disponible";

      /* ---------- Barrio / Ubicación ---------- */
    let barrioId = body.id_barrio;

    if (!barrioId) {
      if (!body.barrio || body.barrio.trim() === "") {
        throw new Error("El barrio es obligatorio");
      }

      // 👉 Localidad SOLO se usa como contenedor del barrio
      let localidad = await tx.localidad.findFirst({
        where: {
          nombre: body.ciudad?.trim() || "SIN_LOCALIDAD",
        },
      });

      if (!localidad) {
        localidad = await tx.localidad.create({
          data: {
            nombre: body.ciudad?.trim() || "SIN_LOCALIDAD",
          },
        });
      }

      let barrio = await tx.barrio.findFirst({
        where: {
          nombre: body.barrio.trim(),
          id_localidad: localidad.id_localidad,
        },
      });

      if (!barrio) {
        barrio = await tx.barrio.create({
          data: {
            nombre: body.barrio.trim(),
            id_localidad: localidad.id_localidad,
          },
        });
      }

      barrioId = barrio.id_barrio;
    }



      const provincia =
        body.provincia && body.provincia.trim() !== ""
          ? body.provincia.trim()
          : null;


      const ubicacion = await tx.ubicacion.create({
        data: {
          direccion: body.direccion.trim(),
          ciudad: body.ciudad?.trim() ?? null,
          provincia: body.provincia?.trim() ?? null,
          id_barrio: barrioId ? Number(barrioId) : null,
        },
      });



      /* ---------- IMÁGENES ---------- */
      const imagenes = Array.isArray(body.imagenes)
        ? body.imagenes.filter((i: any) => i.url)
        : [];

      if (!imagenes.length)
        throw new Error("Debe subir al menos una imagen");

      if (imagenes.length > 10)
        throw new Error("No se permiten más de 10 imágenes");

      if (!imagenes.some((i: any) => i.principal)) {
        imagenes[0].principal = true;
      }

      /* ---------- Crear Inmueble ---------- */
      const inmueble = await tx.inmueble.create({
        data: {
          titulo: body.titulo,
          superficie_total: toDecimalOrUndefined(body.superficie_total)!,
          superficie_cubierta: toDecimalOrUndefined(body.superficie_cubierta),
          precio: toDecimalOrUndefined(body.precio),
          cantidad_ambientes: toNumberOrUndefined(body.cantidad_ambientes),
          cantidad_banos: toNumberOrUndefined(body.cantidad_banos),
          cantidad_dormitorios: toNumberOrUndefined(body.cantidad_dormitorios),
          cantidad_cocheras: toNumberOrUndefined(body.cantidad_cocheras),
          cantidad_pisos: toNumberOrUndefined(body.cantidad_pisos),
          antiguedad: toNumberOrUndefined(body.antiguedad),
          archivado,
          createdById: user.id,
          updatedById: user.id,
          id_tipo_inmueble: Number(body.id_tipo_inmueble),
          id_estado: Number(body.id_estado),
          id_cliente: Number(clienteId),
          id_operacion: Number(body.id_operacion),
          id_ubicacion: ubicacion.id_ubicacion,
          foto: imagenes.find((i: any) => i.principal)?.url ?? "/placeholder.jpg",
        },
        select: {
          id_inmueble: true,
          titulo: true,
          superficie_total: true,
          superficie_cubierta: true,
          precio: true,
          createdAt: true,
          updatedAt: true,
          tipo_inmueble: { select: { nombre: true } },
          estado: { select: { nombre: true } },
          cliente: { select: { nombre: true } },
          imagenes: { select: { url: true, principal: true } },
        },
      });

      await tx.inmuebleImagen.createMany({
        data: imagenes.map((img: any) => ({
          url: img.url,
          principal: Boolean(img.principal),
          inmuebleId: inmueble.id_inmueble,
        })),
      });

      return inmueble;
    });

    return NextResponse.json(
      {
        ...result,
        superficie_total: Number(result.superficie_total),
        superficie_cubierta: result.superficie_cubierta
          ? Number(result.superficie_cubierta)
          : null,
        precio: result.precio ? Number(result.precio) : null,
        createdAt: result.createdAt?.toISOString(),
        updatedAt: result.updatedAt?.toISOString(),
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("❌ Error POST /api/inmuebles:", error);
    return NextResponse.json(
      { error: error.message || "Error al crear inmueble" },
      { status: 400 }
    );
  }
}
