//app/api/inmuebles/[id]/route.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { InmuebleDTO } from "@/types/inmuebles";
import { Prisma } from "@/generated/prisma";


const toNumberOrUndefined = (v: any): number | undefined =>
  v !== undefined && v !== null && v !== "" ? Number(v) : undefined;
const toDecimalOrUndefined = (v: any): Prisma.Decimal | undefined =>
  v !== undefined && v !== null && v !== "" ? new Prisma.Decimal(Number(v)) : undefined;

// ✅ GET → por ID -> versión con DTO hecha por sebastian 
// export async function GET(_req: Request, { params }: { params: { id: string } }) {
//   try {
//     const id = Number(params.id);
//     if (Number.isNaN(id)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

//     const inmueble = await db.inmueble.findUnique({
//       where: { id_inmueble: id },
//       include: {
//         tipo_inmueble: true,
//         estado: true,
//         operacion: true,
//         cliente: true,
//         ubicacion: { include: { barrio: { include: { localidad: true } } } },
//         imagenes: true,
//       },
//     });

//     if (!inmueble)
//       return NextResponse.json({ error: "Inmueble no encontrado" }, { status: 404 });

//     const imagenes = inmueble.imagenes.map((img: any) => ({
//       id: img.id,
//       url: img.url,
//       inmuebleId: img.inmuebleId,
//       principal: Boolean(img.principal),
//     }));

//     const dto: InmuebleDTO = {
//       id_inmueble: inmueble.id_inmueble,
//       id_tipo_inmueble: inmueble.id_tipo_inmueble,
//       id_ubicacion: inmueble.id_ubicacion,
//       id_estado: inmueble.id_estado,
//       id_cliente: inmueble.id_cliente,
//       id_operacion: inmueble.id_operacion ?? undefined,
//       precio: Number(inmueble.precio) || null,
//       superficie_total: Number(inmueble.superficie_total),
//       superficie_cubierta: inmueble.superficie_cubierta
//         ? Number(inmueble.superficie_cubierta)
//         : null,
//       cantidad_ambientes: inmueble.cantidad_ambientes ?? null,
//       cantidad_banos: inmueble.cantidad_banos ?? null,
//       cantidad_dormitorios: inmueble.cantidad_dormitorios ?? null,
//       cantidad_cocheras: inmueble.cantidad_cocheras ?? null,
//       cantidad_pisos: inmueble.cantidad_pisos ?? null,
//       antiguedad: inmueble.antiguedad ?? null,
//       foto: inmueble.foto ?? null,
//       fotoPrincipal:
//         imagenes.find((i) => i.principal)?.url || inmueble.foto || "/placeholder.jpg",
//       detalles: inmueble.detalles ?? null,
//       titulo: inmueble.titulo,
//       archivado: Boolean(inmueble.archivado),
//       tipo_inmueble: {
//         id_tipo_inmueble: inmueble.tipo_inmueble.id_tipo_inmueble,
//         nombre: inmueble.tipo_inmueble.nombre,
//       },
//       operacion: inmueble.operacion
//         ? { id_operacion: inmueble.operacion.id_operacion, nombre: inmueble.operacion.nombre }
//         : undefined,
//       ubicacion: inmueble.ubicacion
//   ? {
//       id_ubicacion: inmueble.ubicacion.id_ubicacion,
//       direccion: inmueble.ubicacion.direccion ?? "",
//       ciudad: inmueble.ubicacion.ciudad ?? "",
//       provincia: inmueble.ubicacion.provincia ?? "",
//       id_barrio: inmueble.ubicacion.id_barrio ?? 0,
//       barrio: inmueble.ubicacion.barrio
//         ? {
//             id_barrio: inmueble.ubicacion.barrio.id_barrio,
//             nombre: inmueble.ubicacion.barrio.nombre,
//             id_localidad: inmueble.ubicacion.barrio.id_localidad,
//             localidad: {
//               id_localidad:
//                 inmueble.ubicacion.barrio.localidad?.id_localidad ?? 0,
//               nombre: inmueble.ubicacion.barrio.localidad?.nombre ?? "",
//             },
//           }
//         : null,
//     }
//   : undefined,

//       estado: {
//         id_estado: inmueble.estado.id_estado,
//         nombre: inmueble.estado.nombre,
//       },
//       cliente: inmueble.cliente
//         ? { id_cliente: inmueble.cliente.id_cliente, nombre: inmueble.cliente.nombre }
//         : null,
//       imagenes,
//       estadoNombre: inmueble.estado.nombre.toLowerCase() as "venta" | "alquiler",
//     };

//     return NextResponse.json(dto);
//   } catch (error) {
//     console.error("❌ Error GET /inmueble/id:", error);
//     return NextResponse.json({ error: "Error al obtener inmueble" }, { status: 500 });
//   }
// }

// ✅ GET → Obtener inmueble por ID -> versión sin DTO por pillack (devuelve todo tal cual está en la BD)
export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const idNumber = parseInt(id);

    if (isNaN(idNumber)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const inmueble = await db.inmueble.findUnique({
      where: { id_inmueble: idNumber },
      include: {
        tipo_inmueble: true,
        ubicacion: {
          include: {
            barrio: {
              include: { localidad: true },
            },
          },
        },
        estado: true,
        operacion: true,
        cliente: true, // Propietario del inmueble
      },
    });

    if (!inmueble) {
      return NextResponse.json({ error: "Inmueble no encontrado" }, { status: 404 });
    }

    return NextResponse.json(inmueble, { status: 200 });
  } catch (error) {
    console.error("❌ Error GET /inmueble/id:", error);
    return NextResponse.json({ error: "Error al obtener inmueble" }, { status: 500 });
  }
}

// 🟡 PUT → actualizar inmueble
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  try {
    const payload = await req.json();

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
      foto: payload.imagenes?.find((i: any) => i.principal)?.url ?? null,
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
    return NextResponse.json({ error: "Error al actualizar inmueble" }, { status: 500 });
  }
}

// 🔴 DELETE → Eliminar inmueble (solo si está archivado)
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  try {
    // ✅ Verificar si existe y está archivado
    const inmueble = await db.inmueble.findUnique({
      where: { id_inmueble: id },
    });

    if (!inmueble) {
      return NextResponse.json({ error: "Inmueble no encontrado" }, { status: 404 });
    }

    if (!inmueble.archivado) {
      return NextResponse.json({ error: "Solo se pueden eliminar inmuebles archivados" }, { status: 400 });
    }

    // ✅ Eliminar todos los registros dependientes del inmueble (debido a onDelete: Restrict)
    // Contratos
    await db.contrato.deleteMany({ where: { id_inmueble: id } });
    // Cobranzas
    await db.cobranza.deleteMany({ where: { id_inmueble: id } });
    // Rendiciones
    await db.rendicion.deleteMany({ where: { id_inmueble: id } });
    // Pagos
    await db.pago.deleteMany({ where: { id_inmueble: id } });
    // Historial (para Inmueble)
    await db.historial.deleteMany({ where: { id_inmueble: id } });
    // Imágenes
    await db.inmuebleImagen.deleteMany({ where: { inmuebleId: id } });

    // ✅ Ahora eliminar el inmueble (las relaciones required como tipo_inmueble, estado, cliente no bloquean el delete del child)
    await db.inmueble.delete({ where: { id_inmueble: id } });

    // ✅ Finalmente, eliminar la ubicación si existía (ahora sin referencia del inmueble)
    const ubicacionToDelete = await db.ubicacion.findFirst({
      where: {
        inmuebles: {
          none: {} // No more inmuebles referencing it
        }
      },
      select: { id_ubicacion: true }
    });

    if (ubicacionToDelete) {
      // Desconectar barrio si es necesario
      await db.ubicacion.update({
        where: { id_ubicacion: ubicacionToDelete.id_ubicacion },
        data: { id_barrio: null }
      });
      await db.ubicacion.delete({ where: { id_ubicacion: ubicacionToDelete.id_ubicacion } });
    }

    return NextResponse.json({ message: "Inmueble eliminado correctamente" });
  } catch (error: any) {
    console.error("❌ Error DELETE /inmueble/id:", error);
    console.error("Error details:", error.message);
    return NextResponse.json({ error: "Error al eliminar inmueble: " + error.message }, { status: 500 });
  }
}

// 🟠 PATCH → archivar/desarchivar
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    const { archivado } = await req.json();

    const actualizado = await db.inmueble.update({
      where: { id_inmueble: id },
      data: { archivado },
    });

    return NextResponse.json(actualizado);
  } catch (error) {
    console.error("❌ Error PATCH /inmueble/id:", error);
    return NextResponse.json({ error: "Error al archivar inmueble" }, { status: 500 });
  }
}