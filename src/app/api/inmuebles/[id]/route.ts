import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { InmuebleDTO } from "@/types/inmuebles";

export const GET = async (_req: Request, { params }: { params: { id: string } }) => {
  try {
    const id = Number(params.id);
    if (Number.isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const i = await prisma.inmueble.findUnique({
      where: { id_inmueble: id },
      include: {
        tipo_inmueble: true,
        ubicacion: {
          include: { barrio: { include: { localidad: true } } },
        },
        imagenes: true,
      },
    });

    if (!i) {
      return NextResponse.json({ error: "Inmueble no encontrado" }, { status: 404 });
    }

    // 1) Mapeo de imágenes
    const imagenes = i.imagenes.map((img) => ({
      id: img.id,
      url: img.url,
      inmuebleId: img.inmuebleId,
      principal: (img as unknown as { principal?: boolean }).principal ?? false,
    }));

    // 2) Foto principal desde el array tipado
    const fotoPrincipal =
      imagenes.find((img) => img.principal)?.url ||
      i.foto ||
      "/placeholder.jpg";

    // 3) Ubicación extendida
    type UbicacionMaybe = typeof i.ubicacion & {
      ciudad?: string | null;
      provincia?: string | null;
      id_barrio?: number | null;
    };
    const u = i.ubicacion as UbicacionMaybe;

    const dto: InmuebleDTO = {
      id_inmueble: i.id_inmueble,
      id_tipo_inmueble: i.id_tipo_inmueble,
      id_ubicacion: i.id_ubicacion,
      id_estado: i.id_estado,
      id_cliente: i.id_cliente,
      precio: i.precio.toNumber(),
      superficie_total: i.superficie_total.toNumber(),
      superficie_cubierta: i.superficie_cubierta?.toNumber() ?? null,
      cantidad_ambientes: i.cantidad_ambientes ?? null,
      antiguedad: i.antiguedad ?? null,
      foto: i.foto ?? null,
      fotoPrincipal,
      detalles: i.detalles ?? null,
      tipo_inmueble: {
        id_tipo_inmueble: i.tipo_inmueble.id_tipo_inmueble,
        nombre: i.tipo_inmueble.nombre,
      },
      ubicacion: {
        id_ubicacion: i.ubicacion.id_ubicacion,
        direccion: i.ubicacion.direccion,
        ciudad: u.ciudad ?? null,
        provincia: u.provincia ?? null,
        id_barrio: u.id_barrio ?? null,
        barrio: u.barrio
          ? {
              id_barrio: u.barrio.id_barrio,
              nombre: u.barrio.nombre,
              id_localidad: u.barrio.id_localidad,
              localidad: {
                id_localidad: u.barrio.localidad.id_localidad,
                nombre: u.barrio.localidad.nombre,
              },
            }
          : null,
      },
      imagenes,
    };

    return NextResponse.json(dto);
  } catch (error) {
    console.error("Error al obtener el inmueble:", error);
    return NextResponse.json({ error: "Error al obtener el inmueble" }, { status: 500 });
  }
};
