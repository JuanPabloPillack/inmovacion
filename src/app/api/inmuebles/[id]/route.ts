import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { InmuebleDTO } from "@/types/inmuebles";
import type {
  Inmueble as PrismaInmueble,
  InmuebleImagen as PrismaInmuebleImagen,
  Tipo_inmueble as PrismaTipo,
  Ubicacion as PrismaUbicacion,
  Barrio as PrismaBarrio,
  Localidad as PrismaLocalidad,
  Estado as PrismaEstado,
} from "@prisma/client";

type InmuebleWithRelations = PrismaInmueble & {
  tipo_inmueble: PrismaTipo;
  estado: PrismaEstado;
  ubicacion: PrismaUbicacion & {
    barrio?: PrismaBarrio & { localidad?: PrismaLocalidad } | null;
  };
  imagenes: PrismaInmuebleImagen[];
};

// 🟢 GET: obtener un inmueble por id
export async function GET(
  _req: Request,
  context: { params: { id: string } }
) {
  try {
    const id = Number(context.params.id);
    if (Number.isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const i = (await db.inmueble.findUnique({
      where: { id_inmueble: id },
      include: {
        tipo_inmueble: true,
        estado: true,
        ubicacion: { include: { barrio: { include: { localidad: true } } } },
        imagenes: true,
      },
    })) as InmuebleWithRelations | null;

    if (!i) {
      return NextResponse.json({ error: "Inmueble no encontrado" }, { status: 404 });
    }

    const imagenes = (i.imagenes || []).map((img) => ({
      id: img.id,
      url: img.url,
      inmuebleId: img.inmuebleId,
      principal: Boolean(img.principal),
    }));

    const fotoPrincipal =
      imagenes.find((img) => img.principal)?.url || i.foto || "/placeholder.jpg";

    const ubicacion = {
      id_ubicacion: i.ubicacion.id_ubicacion,
      direccion: i.ubicacion.direccion,
      ciudad: i.ubicacion?.barrio?.localidad?.nombre ?? null,
      provincia: null,
      id_barrio: i.ubicacion.id_barrio ?? null,
      barrio: i.ubicacion.barrio
        ? {
            id_barrio: i.ubicacion.barrio.id_barrio,
            nombre: i.ubicacion.barrio.nombre,
            id_localidad: i.ubicacion.barrio.id_localidad,
            localidad: {
              id_localidad: i.ubicacion.barrio.localidad?.id_localidad ?? 0,
              nombre: i.ubicacion.barrio.localidad?.nombre ?? "",
            },
          }
        : null,
    };

    const dto: InmuebleDTO = {
      id_inmueble: i.id_inmueble,
      id_tipo_inmueble: i.id_tipo_inmueble,
      id_ubicacion: i.id_ubicacion,
      id_estado: i.id_estado,
      estado: i.estado.nombre.toLowerCase() as "venta" | "alquiler",
      id_cliente: i.id_cliente,
      precio: Number(i.precio),
      superficie_total: Number(i.superficie_total),
      superficie_cubierta:
        i.superficie_cubierta != null ? Number(i.superficie_cubierta) : null,
      cantidad_ambientes: i.cantidad_ambientes ?? null,
      antiguedad: i.antiguedad ?? null,
      foto: i.foto ?? null,
      fotoPrincipal,
      detalles: i.detalles ?? null,
      titulo: i.titulo, // 🔹 agregado para cumplir InmuebleDTO
      tipo_inmueble: {
        id_tipo_inmueble: i.tipo_inmueble.id_tipo_inmueble,
        nombre: i.tipo_inmueble.nombre,
      },
      ubicacion,
      imagenes,
    };

    return NextResponse.json(dto);
  } catch (error) {
    console.error("Error al obtener el inmueble:", error);
    return NextResponse.json({ error: "Error al obtener el inmueble" }, { status: 500 });
  }
}

// 🟡 PUT: actualizar inmueble
export async function PUT(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    const id = Number(context.params.id);
    if (Number.isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const data = await req.json();

    const inmuebleActualizado = await db.inmueble.update({
      where: { id_inmueble: id },
      data,
    });

    return NextResponse.json(inmuebleActualizado);
  } catch (error) {
    console.error("Error al actualizar el inmueble:", error);
    return NextResponse.json({ error: "Error al actualizar el inmueble" }, { status: 500 });
  }
}

// 🔴 DELETE: eliminar inmueble
export async function DELETE(
  _req: Request,
  context: { params: { id: string } }
) {
  try {
    const id = Number(context.params.id);
    if (Number.isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    await db.inmueble.delete({
      where: { id_inmueble: id },
    });

    return NextResponse.json({ message: "Inmueble eliminado con éxito" });
  } catch (error) {
    console.error("Error al eliminar el inmueble:", error);
    return NextResponse.json({ error: "Error al eliminar el inmueble" }, { status: 500 });
  }
}
